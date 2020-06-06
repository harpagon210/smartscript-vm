import OpCode from './OpCode';
import Obj from './objects/Obj';

class Chunk {
  code: Array<OpCode|number>;

  lines: Array<number>;

  constants: Array<Obj>;

  constructor() {
    this.code = [];
    this.lines = [];
    this.constants = [];
  }

  write(byte: OpCode | number, line: number) {
    this.code.push(byte);
    this.lines.push(line);
  }

  addConstant(obj: Obj): number {
    this.constants.push(obj);

    return this.constants.length - 1;
  }
}

export default Chunk;
