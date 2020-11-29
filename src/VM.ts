import { performance } from 'perf_hooks';
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
import ObjArray from './objects/ObjArray';
// eslint-disable-next-line import/no-cycle
import ArrayClass from './nativeclasses/Array';
// eslint-disable-next-line import/no-cycle
import MapClass from './nativeclasses/Map';

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

  errors: string;

  private remainingGas: number;

  private gasCostOp: Map<OpCode, number>;

  private globals: Map<string, Obj>;

  private frames: Array<CallFrame>;

  private openUpValues: ObjUpValue;

  private benchmarks: Map<OpCode, Array<number>>;

  constructor(gasCostOp: Map<OpCode, number> = null) {
    this.ip = null;
    this.stack = [];
    this.chunk = null;
    this.globals = new Map();
    this.frames = [];
    this.openUpValues = null;
    this.gasCostOp = gasCostOp;

    // START NATIVE FUNCTIONS/CLASSES

    const clock = () => new ObjNumber(BigInt(Math.round(performance.now())));

    this.defineNative('clock', new ObjNativeFunction(clock, 'clock'));
    this.setGlobal('Map', MapClass);
    this.setGlobal('Array', ArrayClass);

    // END NATIVE FUNCTIONS/CLASSES

    this.benchmarks = new Map<OpCode, Array<number>>();
  }

  static compile(source: string) {
    const scanner = new Scanner(source);
    const compiler = new Compiler(FunctionType.TypeScript, scanner);
    return compiler.compile();
  }

  async interpret(source: string | ObjFunction, availableGas: number = 0):
  Promise<{ result: InterpretResult, errors: string, gasUsed: number }> {
    this.remainingGas = availableGas;
    let func: ObjFunction;
    let compilationResult = null;
    if (source instanceof ObjFunction) {
      func = source;
    } else {
      const scanner = new Scanner(source);
      const compiler = new Compiler(FunctionType.TypeScript, scanner);
      compilationResult = compiler.compile();
      func = compilationResult.func;
    }
    if (compilationResult && compilationResult.result === InterpretResult.InterpretCompileError) {
      return {
        result: InterpretResult.InterpretCompileError,
        errors: compilationResult.errors,
        gasUsed: 0,
      };
    }

    const closure = new ObjClosure(func);

    this.push(closure);

    this.frames.push(new CallFrame(closure, 0, 0));

    if (process.env.BENCHMARK === 'true') {
      const res = await this.run();
      // eslint-disable-next-line no-console
      console.log('OpCode,Count,Total,Min,Max');
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

      return {
        result: res.result,
        errors: res.errors,
        gasUsed: availableGas - this.remainingGas,
      };
    }

    const res = await this.run();

    return {
      result: res.result,
      errors: res.errors,
      gasUsed: availableGas - this.remainingGas,
    };
  }

  private push(obj: Obj): void {
    this.stack.push(obj);
  }

  public pop(): Obj {
    return this.stack.pop();
  }

  public setGlobal(key: string, obj: Obj): { isNewKey: boolean, error: boolean } {
    const originalObj = this.globals.get(key);
    const isNewKey = originalObj === undefined;

    if (originalObj && originalObj.isConstant === true) {
      return { isNewKey, error: true };
    }

    this.globals.set(key, obj);
    return { isNewKey, error: false };
  }

  public getGlobal(key: string): Obj {
    return this.globals.get(key);
  }

  private calculateGasCostOperation(opCode: OpCode) {
    if (this.gasCostOp) {
      const cost = this.gasCostOp.get(opCode);

      if (cost) {
        return cost;
      }
    }

    return 0;
  }

  private binaryOp(operator: string): boolean {
    if (!(this.peek(0) instanceof ObjNumber) || !(this.peek(1) instanceof ObjNumber)) {
      this.runtimeError('Operands must be numbers.');
      return false;
    }

    const b = this.pop() as ObjNumber;
    const a = this.pop() as ObjNumber;

    let res = null;

    switch (operator) {
      case '-':
        res = a.val - b.val;
        break;
      case '*':
        res = a.val * b.val;
        break;
      case '/':
        res = a.val / b.val;
        break;
      case '<':
        res = a.val < b.val;
        break;
      case '>':
        res = a.val > b.val;
        break;
      case '%':
        res = a.val % b.val;
        break;
      case '**':
        res = a.val ** b.val;
        break;
      case '&':
        // eslint-disable-next-line no-bitwise
        res = a.val & b.val;
        break;
      case '|':
        // eslint-disable-next-line no-bitwise
        res = a.val | b.val;
        break;
      case '^':
        // eslint-disable-next-line no-bitwise
        res = a.val ^ b.val;
        break;
      case '<<':
        // eslint-disable-next-line no-bitwise
        res = a.val << b.val;
        break;
      case '>>':
        // eslint-disable-next-line no-bitwise
        res = a.val >> b.val;
        break;
      default:
        break;
    }

    this.push(typeof res === 'boolean' ? new ObjBool(res) : new ObjNumber(res));
    return true;
  }

  peek(distance: number): Obj {
    return this.stack[this.stack.length - 1 - distance];
  }

  private resetStack(): void {
    this.stack = [];
  }

  private defineNative(name: string, func: ObjNativeFunction) {
    this.setGlobal(name, func);
  }

  private call(closure: ObjClosure, argCount: number): boolean {
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

  private async invokeFromClass(klass: ObjClass | ObjNativeClass,
    name: string, argCount: number): Promise<boolean> {
    if (klass instanceof ObjNativeClass) {
      const method = klass.getMethod(name);
      if (!method) {
        this.runtimeError(`Undefined property '${name}'.`);
        return false;
      }

      const result = await method(this, argCount, ...this.stack.slice(-argCount));
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

  private async invoke(name: string, argCount: number): Promise<boolean> {
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

  private async callValue(callee: Obj, argCount: number): Promise<boolean> {
    if (callee instanceof ObjBoundMethod) {
      this.stack[this.stack.length - argCount - 1] = callee.receiver;
      return this.call(callee.method, argCount);
    }

    if (callee instanceof ObjNativeClass) {
      this.stack[this.stack.length - argCount - 1] = new ObjInstance(callee);
      const initializer = callee.getMethod('constructor');
      if (initializer) {
        const result = await initializer(this, argCount, ...this.stack.slice(-argCount));
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
      const result = await callee.func(argCount, ...this.stack.slice(-argCount));
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
    this.errors = `runtime exception: ${error}`;
    for (let i = this.frames.length - 1; i >= 0; i -= 1) {
      const frame = this.frames[i];
      const { closure } = frame;
      const line = closure.func.chunk.lines[frame.ip];
      if (!closure.func.name) {
        this.errors += `\n[line ${line}] in main script`;
      } else {
        this.errors += `\n[line ${line}] in ${closure.func.name}()`;
      }
    }

    this.resetStack();
  }

  buildInterpretResult(result: InterpretResult): { result: InterpretResult, errors: string } {
    return {
      result,
      errors: this.errors,
    };
  }

  private captureUpvalue(local: number): ObjUpValue {
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

  private closeUpvalues(last: number): void {
    while (this.openUpValues !== null
      && this.openUpValues.location >= last) {
      const upvalue = this.openUpValues;
      upvalue.closed = this.stack[last];
      this.openUpValues = upvalue.next;
    }
  }

  private defineMethod(name: string): void {
    const method = this.peek(0);
    const klass = this.peek(1);
    if (method instanceof ObjClosure && klass instanceof ObjClass) {
      klass.setMethod(name, method);
    }
    this.pop();
  }

  private bindMethod(klass: ObjClass, name: string): boolean {
    const method = klass.getMethod(name);
    if (!method) {
      this.runtimeError(`Undefined property '${name}'.`);
      return false;
    }

    this.pop();
    this.push(new ObjBoundMethod(this.peek(0), method));
    return true;
  }

  private async run(): Promise<{ result: InterpretResult, errors: string }> {
    for (; ;) {
      let frame = this.frames[this.frames.length - 1];
      const instruction = frame.readByte();

      const opCost = this.calculateGasCostOperation(instruction);

      if (this.remainingGas - opCost < 0) {
        return {
          result: InterpretResult.InterpretRuntimeOutOfGas,
          errors: 'out of gas',
        };
      }

      this.remainingGas -= opCost;

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
            return this.buildInterpretResult(InterpretResult.InterpretRuntimeError);
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
          const result = this.setGlobal(name.val, this.peek(0));

          if (result.error === true) {
            this.runtimeError(`Cannot reassing const ${name.asString()}`);
            return this.buildInterpretResult(InterpretResult.InterpretRuntimeError);
          }

          if (result.isNewKey === true) {
            this.globals.delete(name.val);
            this.runtimeError(`Undefined variable ${name.val}`);
            return this.buildInterpretResult(InterpretResult.InterpretRuntimeError);
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
            if (frame.closure.upvalues[slot].closed.isConstant === false) {
              frame.closure.upvalues[slot].closed = this.peek(0);
            } else {
              this.runtimeError(`Cannot reassing const ${frame.closure.upvalues[slot].closed.asString()}`);
              return this.buildInterpretResult(InterpretResult.InterpretRuntimeError);
            }
          } else if (this.stack[frame.closure.upvalues[slot].location].isConstant === false) {
            this.stack[frame.closure.upvalues[slot].location] = this.peek(0);
          } else {
            this.runtimeError(`Cannot reassing const ${this.stack[frame.closure.upvalues[slot].location].asString()}`);
            return this.buildInterpretResult(InterpretResult.InterpretRuntimeError);
          }
          break;
        }
        case OpCode.OpGetProperty: {
          if (!(this.peek(0) instanceof ObjInstance)) {
            this.runtimeError('Only instances have properties.');
            return this.buildInterpretResult(InterpretResult.InterpretRuntimeError);
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
            return this.buildInterpretResult(InterpretResult.InterpretRuntimeError);
          }
          break;
        }
        case OpCode.OpSetProperty: {
          if (!(this.peek(1) instanceof ObjInstance)) {
            this.runtimeError('Only instances have fields.');
            return this.buildInterpretResult(InterpretResult.InterpretRuntimeError);
          }
          const instance = this.peek(1) as ObjInstance;
          const prop = (frame.readConstant() as ObjString).val;
          const result = instance.setField(prop, this.peek(0));

          if (result.error === true) {
            this.runtimeError(`Cannot reassing const ${prop}`);
            return this.buildInterpretResult(InterpretResult.InterpretRuntimeError);
          }

          const value = this.pop();
          this.pop();
          this.push(value);
          break;
        }
        case OpCode.OpGetSuper: {
          const name = frame.readConstant() as ObjString;
          const superclass = this.pop() as ObjClass;
          if (!this.bindMethod(superclass, name.val)) {
            return this.buildInterpretResult(InterpretResult.InterpretRuntimeError);
          }
          break;
        }
        case OpCode.OpEqual: {
          const b = this.pop();
          const a = this.pop();
          let result: boolean = false;
          if (a instanceof ObjBool && b instanceof ObjBool && a.val === b.val) {
            result = true;
          } else if (a instanceof ObjNumber && b instanceof ObjNumber && a.val === b.val) {
            result = true;
          } else if (a instanceof ObjString && b instanceof ObjString && a.val === b.val) {
            result = true;
          } else if (a instanceof ObjNull && b instanceof ObjNull) {
            result = true;
          }

          this.push(new ObjBool(result));
          break;
        }
        case OpCode.OpGreater: {
          if (!this.binaryOp('>')) {
            return this.buildInterpretResult(InterpretResult.InterpretRuntimeError);
          }
          break;
        }
        case OpCode.OpLess: {
          if (!this.binaryOp('<')) {
            return this.buildInterpretResult(InterpretResult.InterpretRuntimeError);
          }
          break;
        }
        case OpCode.OpAdd: {
          if (this.peek(0) instanceof ObjString && this.peek(1) instanceof ObjString) {
            const b = this.pop() as ObjString;
            const a = this.pop() as ObjString;
            this.push(new ObjString(`${a.val}${b.val}`));
          } else if (this.peek(0) instanceof ObjNumber && this.peek(1) instanceof ObjNumber) {
            const b = this.pop() as ObjNumber;
            const a = this.pop() as ObjNumber;

            this.push(new ObjNumber(a.val + b.val));
          } else {
            this.runtimeError('Operands must be two numbers or two strings.');
            return this.buildInterpretResult(InterpretResult.InterpretRuntimeError);
          }
          break;
        }
        case OpCode.OpSubtract: {
          if (!this.binaryOp('-')) {
            return this.buildInterpretResult(InterpretResult.InterpretRuntimeError);
          }
          break;
        }
        case OpCode.OpMultiply: {
          if (!this.binaryOp('*')) {
            return this.buildInterpretResult(InterpretResult.InterpretRuntimeError);
          }
          break;
        }
        case OpCode.OpDivide: {
          if (!this.binaryOp('/')) {
            return this.buildInterpretResult(InterpretResult.InterpretRuntimeError);
          }
          break;
        }
        case OpCode.OpModulo: {
          if (!this.binaryOp('%')) {
            return this.buildInterpretResult(InterpretResult.InterpretRuntimeError);
          }
          break;
        }
        case OpCode.OpExponent: {
          if (!this.binaryOp('**')) {
            return this.buildInterpretResult(InterpretResult.InterpretRuntimeError);
          }
          break;
        }
        case OpCode.OpBitwiseAnd: {
          if (!this.binaryOp('&')) {
            return this.buildInterpretResult(InterpretResult.InterpretRuntimeError);
          }
          break;
        }
        case OpCode.OpBitwiseOr: {
          if (!this.binaryOp('|')) {
            return this.buildInterpretResult(InterpretResult.InterpretRuntimeError);
          }
          break;
        }
        case OpCode.OpBitwiseXor: {
          if (!this.binaryOp('^')) {
            return this.buildInterpretResult(InterpretResult.InterpretRuntimeError);
          }
          break;
        }
        case OpCode.OpBitwiseShiftLeft: {
          if (!this.binaryOp('<<')) {
            return this.buildInterpretResult(InterpretResult.InterpretRuntimeError);
          }
          break;
        }
        case OpCode.OpBitwiseShiftRight: {
          if (!this.binaryOp('>>')) {
            return this.buildInterpretResult(InterpretResult.InterpretRuntimeError);
          }
          break;
        }
        case OpCode.OpNot: {
          let result = false;
          const pop = this.pop();
          if (pop instanceof ObjNull
            || (pop instanceof ObjBool && (pop as ObjBool).val === false)) {
            result = true;
          }

          this.push(new ObjBool(result));
          break;
        }
        case OpCode.OpNegate: {
          if (!(this.peek(0) instanceof ObjNumber)) {
            this.runtimeError('Operand must be a number.');
            return this.buildInterpretResult(InterpretResult.InterpretRuntimeError);
          }

          this.push(new ObjNumber((this.pop() as ObjNumber).val * -1n));
          break;
        }
        case OpCode.OpBitwiseNot: {
          if (!(this.peek(0) instanceof ObjNumber)) {
            this.runtimeError('Operand must be a number.');
            return this.buildInterpretResult(InterpretResult.InterpretRuntimeError);
          }

          // eslint-disable-next-line no-bitwise
          this.push(new ObjNumber(~(this.pop() as ObjNumber).val));
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
          // eslint-disable-next-line no-await-in-loop
          if (!await this.callValue(this.peek(argCount), argCount)) {
            return this.buildInterpretResult(InterpretResult.InterpretRuntimeError);
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
            return this.buildInterpretResult(InterpretResult.InterpretRuntimeOk);
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
            return this.buildInterpretResult(InterpretResult.InterpretRuntimeError);
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
          // eslint-disable-next-line no-await-in-loop
          if (!await this.invoke(method.val, argCount)) {
            return this.buildInterpretResult(InterpretResult.InterpretRuntimeError);
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
          // eslint-disable-next-line no-await-in-loop
          if (!await this.invokeFromClass(superclass, method.val, argCount)) {
            return this.buildInterpretResult(InterpretResult.InterpretRuntimeError);
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

          const arrayNativeClass = this.getGlobal('Array') as ObjNativeClass;
          const array = new ObjInstance(arrayNativeClass, true);
          array.setField('array', new ObjArray(arr));

          this.push(array);

          break;
        }
        case OpCode.OpMapInit: {
          const argCount = frame.readByte();
          if (typeof argCount !== 'number') {
            throw new Error('argCount must be a number');
          }

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
            setFn(this, 0, key, val);
          }
          break;
        }
        case OpCode.OpArrayMapSet: {
          const val = this.pop();
          const index = this.pop();
          const instance = this.peek(0);

          if (!(instance instanceof ObjInstance)) {
            throw new Error('not an ObjInstance');
          } else {
            const setFn = instance.klass.getMethod('set') as Function;
            if (!setFn(this, 0, index, val)) {
              return this.buildInterpretResult(InterpretResult.InterpretRuntimeError);
            }
          }

          break;
        }
        case OpCode.OpArrayMapGet: {
          const index = this.pop();
          const instance = this.peek(0);

          if (!(instance instanceof ObjInstance)) {
            throw new Error('not an ObjInstance');
          } else {
            const getFn = instance.klass.getMethod('get') as Function;
            const val = getFn(this, 0, index);
            if (val === false) {
              return this.buildInterpretResult(InterpretResult.InterpretRuntimeError);
            }
            // pop the instance
            this.pop();
            this.push(val);
          }
          break;
        }
        default:
          return this.buildInterpretResult(InterpretResult.InterpretRuntimeError);
      }

      if (process.env.BENCHMARK === 'true') {
        // benchmarks
        let benchmark = this.benchmarks.get(instruction);
        if (!benchmark) {
          this.benchmarks.set(instruction, []);
          benchmark = this.benchmarks.get(instruction);
        }
        benchmark.push((performance.now() - start) * 1000);
      }
    }
  }
}

export default VM;
