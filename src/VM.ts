import { performance } from 'perf_hooks';
import BigNumber from 'bignumber.js';
import { disassembleInstruction } from './debug';
import Compiler from './Compiler';
import Scanner from './Scanner';
import Obj from './objects/Obj';
import Chunk from './Chunk';
import CallFrame from './CallFrame';
import ObjUpValue from './objects/ObjUpValue';
import { FunctionType, printObj } from './values';
import InterpretResult from './InterpretResult';
import ObjClosure from './objects/ObjClosure';
import ObjNumber from './objects/ObjNumber';
import ObjNativeFunction from './objects/ObjNativeFunction';
import ObjClass from './objects/ObjClass';
import ObjNativeClass from './objects/ObjNativeClass';
import ObjInstance from './objects/ObjInstance';
import ObjBoundMethod from './objects/ObjBoundMethod';
import OpCode from './OpCode';
import ObjNull from './objects/ObjNull';
import ObjBool from './objects/ObjBool';
import ObjString from './objects/ObjString';
import ObjFunction from './objects/ObjFunction';
import ObjUndefined from './objects/ObjUndefined';
import ObjArray from './objects/ObjArray';

const FRAMES_MAX = 11000;

/**
 * VM.
 * @class
 * @constructor
 * @public
 */
class VM {
  ip: number;

  stack: Array<Obj>;

  chunk: Chunk;

  globals: Map<string, Obj>;

  frames: Array<CallFrame>;

  openUpValues: ObjUpValue;

  benchmarks: Map<OpCode, Array<number>>;

  constructor() {
    this.ip = null;
    this.stack = [];
    this.chunk = null;
    this.globals = new Map();
    this.frames = [];
    this.openUpValues = null;

    // START NATIVE FUNCTIONS

    const clock = () => new ObjNumber(new BigNumber(performance.now()));

    this.defineNative('clock', new ObjNativeFunction(clock, 'clock'));

    const mapClass = new ObjNativeClass('Map');
    mapClass.setMethod('set', (argCount: number, key: Obj, value: Obj) => {
      const instance = this.stack[this.stack.length - argCount - 1];
      if (instance instanceof ObjInstance && instance.klass.name === 'Map') {
        instance.setField(key.asString(), value);
        return new ObjNull();
      }
      this.runtimeError('Object is not an instance of Map');
      return false;
    });

    mapClass.setMethod('get', (argCount: number, key: Obj) => {
      const instance = this.stack[this.stack.length - argCount - 1];
      if (instance instanceof ObjInstance && instance.klass.name === 'Map') {
        const name = key.asString();
        const val = instance.getField(name);
        if (val) {
          return val;
        }
        this.runtimeError(`Undefined property '${name}'.`);
        return false;
      }
      this.runtimeError('Object is not an instance of Map');
      return false;
    });

    mapClass.setMethod('has', (argCount: number, key: Obj) => {
      const instance = this.stack[this.stack.length - argCount - 1];
      if (instance instanceof ObjInstance && instance.klass.name === 'Map') {
        return new ObjBool(instance.fields.has(key.asString()));
      }
      this.runtimeError('Object is not an instance of Map');
      return false;
    });

    mapClass.setMethod('clear', (argCount: number) => {
      const instance = this.stack[this.stack.length - argCount - 1];
      if (instance instanceof ObjInstance && instance.klass.name === 'Map') {
        instance.fields.clear();
        return new ObjNull();
      }
      this.runtimeError('Object is not an instance of Map');
      return false;
    });

    this.setGlobal('Map', mapClass);

    /*
    const stringClass = new ObjNativeClass('String');
    stringClass.
    setMethod('test',
    (arg1, arg2) => new Value(VALUE_TYPE.OBJ_VAL, new ObjString(arg2.asString())));

    stringClass.setMethod('constructor', (argCount, string) => {
      // get instance
      const instance = this.stack[this.stack.length - argCount - 1];
      const ins = instance.asObj();
      if (ins instanceof ObjInstance) {
        ins.setField('str', string);
      }

      return true;
    });
    this.setGlobal('String', new Value(VALUE_TYPE.OBJ_VAL, stringClass));
    */
    // END NATIVE FUNCTIONS

    this.benchmarks = new Map<OpCode, Array<number>>();
  }

  static compile(source: string): ObjFunction {
    const scanner = new Scanner(source);
    const compiler = new Compiler(FunctionType.TypeScript, scanner);
    const func = compiler.compile();

    return func;
  }

  interpret(source: string | ObjFunction): InterpretResult {
    let func: ObjFunction;
    if (source instanceof ObjFunction) {
      func = source;
    } else {
      const scanner = new Scanner(source);
      const compiler = new Compiler(FunctionType.TypeScript, scanner);
      func = compiler.compile();
    }

    if (!func) {
      return InterpretResult.InterpretCompileError;
    }

    const closure = new ObjClosure(func);

    this.push(closure);

    this.frames.push(new CallFrame(closure, 0, 0));

    if (process.env.BENCHMARK === 'true') {
      const res = this.run();

      this.benchmarks.forEach((vals: Array<number>, key: OpCode) => {
        const len = vals.length;

        let max = null;
        let min = null;
        let total = 0;
        for (let idx = 0; idx < len; idx += 1) {
          const result = vals[idx];

          if (!max || max < result) {
            max = result;
          }

          if (!min || min > result) {
            min = result;
          }

          total += result;
        }

        // eslint-disable-next-line no-console
        console.log(`${OpCode[key]}, ${len}, ${total}, ${min}, ${max}`);
      });

      return res;
    }

    return this.run();
  }

  push(obj: Obj): void {
    this.stack.push(obj);
  }

  pop(): Obj {
    return this.stack.pop();
  }

  setGlobal(key: string, obj: Obj): boolean {
    const isNewKey = !this.globals.has(key);
    this.globals.set(key, obj);
    return isNewKey;
  }

  getGlobal(key: string): Obj {
    return this.globals.get(key);
  }

  binaryOp(operator: string): InterpretResult {
    if (!(this.peek(0) instanceof ObjNumber) || !(this.peek(1) instanceof ObjNumber)) {
      this.runtimeError('Operands must be numbers.');
      return InterpretResult.InterpretRuntimeError;
    }

    const b = this.pop() as ObjNumber;
    const a = this.pop() as ObjNumber;

    let res = null;

    switch (operator) {
      case '+':
        res = a.val.plus(b.val);
        break;
      case '-':
        res = a.val.minus(b.val);
        break;
      case '*':
        res = a.val.times(b.val);
        break;
      case '/':
        res = a.val.div(b.val);
        break;
      case '<':
        res = a.val.lt(b.val);
        break;
      case '>':
        res = a.val.gt(b.val);
        break;
      default:
        break;
    }

    this.push(typeof res === 'boolean' ? new ObjBool(res) : new ObjNumber(res));
    return InterpretResult.InterpretOk;
  }

  peek(distance: number): Obj {
    return this.stack[this.stack.length - 1 - distance];
  }

  resetStack(): void {
    this.stack = [];
  }

  defineNative(name: string, func: ObjNativeFunction) {
    this.setGlobal(name, func);
  }

  call(closure: ObjClosure, argCount: number): boolean {
    const { arity } = closure.func;
    if (argCount !== arity) {
      this.runtimeError(`Expected ${arity} arguments but got ${argCount}.`);
      return false;
    }
    if (this.frames.length === FRAMES_MAX) {
      this.runtimeError('Stack overflow.');
      return false;
    }
    this.frames.push(new CallFrame(closure, 0, this.stack.length - argCount - 1));
    return true;
  }

  invokeFromClass(klass: ObjClass | ObjNativeClass, name: string, argCount: number): boolean {
    if (klass instanceof ObjNativeClass) {
      const method = klass.getMethod(name);
      if (!method) {
        this.runtimeError(`Undefined property '${name}'.`);
        return false;
      }
      const result = method(argCount, ...this.stack.slice(-argCount));
      // add 1 to the argCount to pop the instance as well
      for (let index = argCount + 1; index > 0; index -= 1) {
        this.stack.pop();
      }

      if (result !== false) {
        this.push(result);
        return true;
      }

      return false;
    }

    const method = klass.getMethod(name);
    if (!method) {
      this.runtimeError(`Undefined property '${name}'.`);
      return false;
    }

    return this.call(method, argCount);
  }

  invoke(name: string, argCount: number): boolean {
    const receiver = this.peek(argCount);
    if (!(receiver instanceof ObjInstance)) {
      this.runtimeError('Only instances have methods.');
      return false;
    }
    const instance = receiver as ObjInstance;

    const value = instance.getField(name);
    if (value) {
      this.stack[this.stack.length - argCount - 1] = value;
      return this.callValue(value, argCount);
    }

    return this.invokeFromClass(instance.klass, name, argCount);
  }

  callValue(callee: Obj, argCount: number): boolean {
    if (callee instanceof ObjBoundMethod) {
      this.stack[this.stack.length - argCount - 1] = callee.receiver;
      return this.call(callee.method, argCount);
    }

    if (callee instanceof ObjNativeClass) {
      this.stack[this.stack.length - argCount - 1] = new ObjInstance(callee);
      const initializer = callee.getMethod('constructor');
      if (initializer) {
        const result = initializer(argCount, ...this.stack.slice(-argCount));
        for (let index = argCount - 1; index >= 0; index -= 1) {
          this.stack.pop();
        }
        return result;
      }

      if (argCount !== 0) {
        this.runtimeError(`Expected 0 arguments but got ${argCount}.`);
        return false;
      }
      return true;
    }

    if (callee instanceof ObjClass) {
      this.stack[this.stack.length - argCount - 1] = new ObjInstance(callee);
      const initializer = callee.getMethod('constructor');
      if (initializer) {
        return this.call(initializer, argCount);
      }

      if (argCount !== 0) {
        this.runtimeError(`Expected 0 arguments but got ${argCount}.`);
        return false;
      }
      return true;
    }

    if (callee instanceof ObjClosure) {
      return this.call(callee, argCount);
    }

    if (callee instanceof ObjNativeFunction) {
      const result = callee.func(argCount, ...this.stack.slice(-argCount));
      for (let index = argCount + 1; index > 0; index -= 1) {
        this.stack.pop();
      }
      this.push(result);
      return true;
    }

    this.runtimeError('Can only call functions and classes.');
    return false;
  }

  runtimeError(error: string): void {
    // eslint-disable-next-line no-console
    console.log(`runtime exception: ${error}`);
    for (let i = this.frames.length - 1; i >= 0; i -= 1) {
      const frame = this.frames[i];
      const { closure } = frame;
      const line = closure.func.chunk.lines[frame.ip];
      if (!closure.func.name) {
        // eslint-disable-next-line no-console
        console.log(`[line ${line}] in main script`);
      } else {
        // eslint-disable-next-line no-console
        console.log(`[line ${line}] in ${closure.func.name}()`);
      }
    }

    this.resetStack();
  }

  captureUpvalue(local: number): ObjUpValue {
    let prevUpvalue = null;
    let upvalue = this.openUpValues;
    while (upvalue !== null && upvalue.location > local) {
      prevUpvalue = upvalue;
      upvalue = upvalue.next;
    }

    if (upvalue !== null && upvalue.location === local) return upvalue;
    const createdUpvalue = new ObjUpValue(local);

    createdUpvalue.next = upvalue;

    if (prevUpvalue === null) {
      this.openUpValues = createdUpvalue;
    } else {
      prevUpvalue.next = createdUpvalue;
    }

    return createdUpvalue;
  }

  closeUpvalues(last: number): void {
    while (this.openUpValues !== null
      && this.openUpValues.location >= last) {
      const upvalue = this.openUpValues;
      upvalue.closed = this.stack[last];
      this.openUpValues = upvalue.next;
    }
  }


  defineMethod(name: string): void {
    const method = this.peek(0);
    const klass = this.peek(1);
    if (method instanceof ObjClosure && klass instanceof ObjClass) {
      klass.setMethod(name, method);
    }
    this.pop();
  }

  bindMethod(klass: ObjClass, name: string): boolean {
    const method = klass.getMethod(name);
    if (!method) {
      this.runtimeError(`Undefined property '${name}'.`);
      return false;
    }

    this.pop();
    this.push(new ObjBoundMethod(this.peek(0), method));
    return true;
  }

  run(): InterpretResult {
    for (; ;) {
      let frame = this.frames[this.frames.length - 1];
      const instruction = frame.readByte();

      if (process.env.DEBUG_TRACE_EXECUTION === 'true') {
        let output = '          ';
        for (let index = 0; index < this.stack.length; index += 1) {
          const slot = this.stack[index];

          output = `${output} [ ${printObj(slot)} ]`;
        }
        // eslint-disable-next-line no-console
        console.log(output);
        disassembleInstruction(frame.closure.func.chunk, frame.ip - 1);
      }

      let start;
      if (process.env.BENCHMARK === 'true') {
        start = performance.now();
      }
      switch (instruction) {
        case OpCode.OpConstant: {
          const constant = frame.readConstant();
          this.push(constant);
          break;
        }
        case OpCode.OpNull: this.push(new ObjNull()); break;
        case OpCode.OpTrue: this.push(new ObjBool(true)); break;
        case OpCode.OpFalse: this.push(new ObjBool(false)); break;
        case OpCode.OpPop: this.pop(); break;
        case OpCode.OpGetLocal: {
          const slot = frame.readByte();
          if (typeof slot !== 'number') {
            throw new Error('slot must be a number');
          }
          this.push(this.stack[frame.slots + slot]);
          break;
        }
        case OpCode.OpSetLocal: {
          const slot = frame.readByte();
          if (typeof slot !== 'number') {
            throw new Error('slot must be a number');
          }
          this.stack[frame.slots + slot] = this.peek(0);
          break;
        }
        case OpCode.OpGetGlobal: {
          const name = frame.readConstant() as ObjString;
          const value = this.globals.get(name.val);
          if (!value) {
            this.runtimeError(`Undefined variable ${name.val}`);
            return InterpretResult.InterpretRuntimeError;
          }
          this.push(value);
          break;
        }
        case OpCode.OpDefineGlobal: {
          const name = frame.readConstant() as ObjString;
          this.setGlobal(name.val, this.peek(0));
          this.pop();
          break;
        }
        case OpCode.OpSetGlobal: {
          const name = frame.readConstant() as ObjString;
          if (this.setGlobal(name.val, this.peek(0))) {
            this.globals.delete(name.val);
            this.runtimeError(`Undefined variable ${name.val}`);
            return InterpretResult.InterpretRuntimeError;
          }
          break;
        }
        case OpCode.OpGetUpvalue: {
          const slot = frame.readByte();
          if (frame.closure.upvalues[slot].closed) {
            this.push(frame.closure.upvalues[slot].closed);
          } else {
            this.push(this.stack[frame.closure.upvalues[slot].location]);
          }
          break;
        }
        case OpCode.OpSetUpvalue: {
          const slot = frame.readByte();

          if (frame.closure.upvalues[slot].closed) {
            frame.closure.upvalues[slot].closed = this.peek(0);
          } else {
            this.stack[frame.closure.upvalues[slot].location] = this.peek(0);
          }
          break;
        }
        case OpCode.OpGetProperty: {
          if (!(this.peek(0) instanceof ObjInstance)) {
            this.runtimeError('Only instances have properties.');
            return InterpretResult.InterpretRuntimeError;
          }
          const instance = this.peek(0) as ObjInstance;
          const name = frame.readConstant() as ObjString;

          const value = instance.getField(name.val);
          if (value) {
            this.pop(); // Instance.
            this.push(value);
            break;
          }

          if (!this.bindMethod(instance.klass as ObjClass, name.val)) {
            return InterpretResult.InterpretRuntimeError;
          }
          break;
        }
        case OpCode.OpSetProperty: {
          if (!(this.peek(1) instanceof ObjInstance)) {
            this.runtimeError('Only instances have fields.');
            return InterpretResult.InterpretRuntimeError;
          }
          const instance = this.peek(1) as ObjInstance;

          instance.setField((frame.readConstant() as ObjString).val, this.peek(0));

          const value = this.pop();
          this.pop();
          this.push(value);
          break;
        }
        case OpCode.OpGetSuper: {
          const name = frame.readConstant() as ObjString;
          const superclass = this.pop() as ObjClass;
          if (!this.bindMethod(superclass, name.val)) {
            return InterpretResult.InterpretRuntimeError;
          }
          break;
        }
        case OpCode.OpEqual: {
          const b = this.pop();
          const a = this.pop();
          let result: boolean = false;
          if (a instanceof ObjBool && b instanceof ObjBool && a.val === b.val) {
            result = true;
          } else if (a instanceof ObjNumber && b instanceof ObjNumber && a.val.eq(b.val)) {
            result = true;
          } else if (a instanceof ObjString && b instanceof ObjString && a.val === b.val) {
            result = true;
          } else if (a instanceof ObjNull && b instanceof ObjNull) {
            result = true;
          }

          this.push(new ObjBool(result));
          break;
        }
        case OpCode.OpGreater: this.binaryOp('>'); break;
        case OpCode.OpLess: this.binaryOp('<'); break;
        case OpCode.OpAdd: {
          if (this.peek(0) instanceof ObjString && this.peek(1) instanceof ObjString) {
            const b = this.pop() as ObjString;
            const a = this.pop() as ObjString;
            this.push(new ObjString(`${a.val}${b.val}`));
          } else if (this.peek(0) instanceof ObjNumber && this.peek(1) instanceof ObjNumber) {
            const b = this.pop() as ObjNumber;
            const a = this.pop() as ObjNumber;

            this.push(new ObjNumber(a.val.plus(b.val)));
          } else {
            this.runtimeError('Operands must be two numbers or two strings.');
            return InterpretResult.InterpretRuntimeError;
          }
          break;
        }
        case OpCode.OpSubtract: {
          this.binaryOp('-');
          break;
        }
        case OpCode.OpMultiply: {
          this.binaryOp('*');
          break;
        }
        case OpCode.OpDivide: {
          this.binaryOp('/');
          break;
        }
        case OpCode.OpNot: {
          let result = false;
          const pop = this.pop();
          if (pop instanceof ObjNull
            || pop instanceof ObjUndefined
            || (pop instanceof ObjBool && (pop as ObjBool).val === false)) {
            result = true;
          }

          this.push(new ObjBool(result));
          break;
        }
        case OpCode.OpNegate: {
          if (!(this.peek(0) instanceof ObjNumber)) {
            this.runtimeError('Operand must be a number.');
            return InterpretResult.InterpretRuntimeError;
          }

          this.push(new ObjNumber((this.pop() as ObjNumber).val.times(-1)));
          break;
        }
        case OpCode.OpPrint: {
          // eslint-disable-next-line no-console
          console.log(printObj(this.pop()));
          break;
        }
        case OpCode.OpJumpIfFalse: {
          const offset = frame.readByte();
          const peek = this.peek(0);
          if (peek instanceof ObjNull
            || peek instanceof ObjUndefined
            || (peek instanceof ObjBool && (peek as ObjBool).val === false)) {
            if (typeof offset !== 'number') {
              throw new Error('offset must be a number');
            }
            frame.ip += offset;
          }
          break;
        }
        case OpCode.OpJump: {
          const offset = frame.readByte();
          if (typeof offset !== 'number') {
            throw new Error('offset must be a number');
          }
          frame.ip += offset;
          break;
        }
        case OpCode.OpLoop: {
          const offset = frame.readByte();
          if (typeof offset !== 'number') {
            throw new Error('offset must be a number');
          }
          frame.ip -= offset;
          break;
        }
        case OpCode.OpCall: {
          const argCount = frame.readByte();
          if (typeof argCount !== 'number') {
            throw new Error('offset must be a number');
          }
          if (!this.callValue(this.peek(argCount), argCount)) {
            return InterpretResult.InterpretRuntimeError;
          }
          break;
        }
        case OpCode.OpClosure: {
          const func = frame.readConstant();
          if (!(func instanceof ObjFunction)) {
            throw new Error('func must be a function');
          }
          const closure = new ObjClosure(func as ObjFunction);

          for (let i = 0; i < closure.upvalues.length; i += 1) {
            const isLocal = frame.readByte();
            const index = frame.readByte();

            if (typeof index !== 'number') {
              throw new Error('index must be a number');
            }
            if (isLocal === 1) {
              closure.upvalues[i] = this.captureUpvalue(frame.slots + index);
            } else {
              closure.upvalues[i] = frame.closure.upvalues[index];
            }
          }
          this.push(closure);
          break;
        }
        case OpCode.OpCloseUpvalue:
          this.closeUpvalues(this.stack.length - 1);
          this.pop();
          break;
        case OpCode.OpReturn: {
          const result = this.pop();

          const frm = this.frames.pop();

          this.closeUpvalues(frm.slots);

          if (this.frames.length === 0) {
            this.pop();
            return InterpretResult.InterpretOk;
          }

          while (this.stack.length > frm.slots && this.stack.length > 0) {
            this.pop();
          }

          this.push(result);
          break;
        }
        case OpCode.OpClass:
          this.push(new ObjClass((frame.readConstant() as ObjString).val));
          break;
        case OpCode.OpInherit: {
          const superclass = this.peek(1);
          if (!(superclass instanceof ObjClass)) {
            this.runtimeError('Superclass must be a class.');
            return InterpretResult.InterpretRuntimeError;
          }
          const subclass = this.pop() as ObjClass;
          const keys = Object.keys(superclass.methods);
          for (let index = 0; index < keys.length; index += 1) {
            const key = keys[index];
            subclass.setMethod(key, superclass.getMethod(key));
          }
          this.push(subclass); // Subclass.
          break;
        }
        case OpCode.OpMethod:
          this.defineMethod((frame.readConstant() as ObjString).val);
          break;
        case OpCode.OpInvoke: {
          const method = frame.readConstant() as ObjString;
          const argCount = frame.readByte();
          if (typeof argCount !== 'number') {
            throw new Error('argCount must be a number');
          }
          if (!this.invoke(method.val, argCount)) {
            return InterpretResult.InterpretRuntimeError;
          }
          frame = this.frames[this.frames.length - 1];
          break;
        }
        case OpCode.OpSuperInvoke: {
          const method = frame.readConstant() as ObjString;
          const argCount = frame.readByte();
          const superclass = this.pop() as ObjClass;
          if (typeof argCount !== 'number') {
            throw new Error('argCount must be a number');
          }
          if (!this.invokeFromClass(superclass, method.val, argCount)) {
            return InterpretResult.InterpretRuntimeError;
          }
          frame = this.frames[this.frames.length - 1];
          break;
        }
        case OpCode.OpArrayInit: {
          const argCount = frame.readByte();
          if (typeof argCount !== 'number') {
            throw new Error('argCount must be a number');
          }

          const arr = new Array(argCount);

          for (let index = argCount - 1; index >= 0; index -= 1) {
            const val = this.pop();
            arr[index] = val;
          }

          this.push(new ObjArray(arr));
          break;
        }
        case OpCode.OpArraySet: {
          const val = this.pop();
          const arrIndex = this.pop();
          let arrIndexNum: number = -1;
          if (!(arrIndex instanceof ObjNumber)) {
            this.runtimeError(`Index ${arrIndex.asString()} is not number.`);
            return InterpretResult.InterpretRuntimeError;
          }
          arrIndexNum = (arrIndex as ObjNumber).val.toNumber();
          const arr = this.pop() as ObjArray;

          if (arrIndexNum < 0 || arrIndexNum > arr.length() - 1) {
            this.runtimeError(`Out of bound ${arrIndexNum}.`);
            return InterpretResult.InterpretRuntimeError;
          }

          arr.set(arrIndexNum, val);
          break;
        }
        case OpCode.OpArrayGet: {
          const arrIndex = this.pop();
          let arrIndexNum: number = -1;
          if (!(arrIndex instanceof ObjNumber)) {
            this.runtimeError(`Index ${arrIndex.asString()} is not number.`);
            return InterpretResult.InterpretRuntimeError;
          }
          arrIndexNum = (arrIndex as ObjNumber).val.toNumber();
          const arr = this.pop() as ObjArray;

          if (arrIndexNum < 0 || arrIndexNum > arr.length() - 1) {
            this.runtimeError(`Out of bound ${arrIndexNum}.`);
            return InterpretResult.InterpretRuntimeError;
          }

          this.push(arr.get(arrIndexNum));
          break;
        }
        case OpCode.OpMapInit: {
          const argCount = frame.readByte();
          if (typeof argCount !== 'number') {
            throw new Error('argCount must be a number');
          }

          // const hash = new ObjHash();
          const mapNativeClass = this.getGlobal('Map') as ObjNativeClass;
          const map = new ObjInstance(mapNativeClass);
          const setFn = map.klass.getMethod('set') as Function;

          const keysValues = [];

          for (let index = 0; index < argCount; index += 1) {
            // value
            keysValues.push(this.pop());
            // key
            keysValues.push(this.pop());
          }

          this.push(map);

          for (let index = keysValues.length - 1; index >= 0; index -= 2) {
            const key = keysValues[index];
            const val = keysValues[index - 1];
            setFn(0, key, val);
          }
          break;
        }
        default:
          return InterpretResult.InterpretRuntimeError;
      }

      if (process.env.BENCHMARK === 'true') {
        // benchmarks
        const benchmark = this.benchmarks.get(instruction);
        if (!benchmark) {
          this.benchmarks.set(instruction, []);
        } else {
          benchmark.push((performance.now() - start) * 1000);
        }
      }
    }
  }
}

export default VM;
