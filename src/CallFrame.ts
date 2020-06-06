import ObjClosure from './objects/ObjClosure';
import Obj from './objects/Obj';
import OpCode from './OpCode';

class CallFrame {
  closure: ObjClosure;

  ip: number;

  slots: number;

  constructor(closure: ObjClosure, ip: number, slots: number) {
    this.ip = ip;
    this.closure = closure;
    this.slots = slots;
  }

  readByte(): OpCode | number {
    this.ip += 1;
    return this.closure.func.chunk.code[this.ip - 1];
  }

  readConstant(): Obj {
    const index = this.readByte();
    if (typeof index !== 'number') {
      throw new Error('byte must be a number');
    }
    return this.closure.func.chunk.constants[index];
  }
}

export default CallFrame;
