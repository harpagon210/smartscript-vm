import Obj from './Obj';
import UpValue from '../UpValue';
import Chunk from '../Chunk';

class ObjFunction implements Obj {
  name?: string;

  upvalues: Array<UpValue>;

  chunk: Chunk;

  arity: number;

  isConstant: boolean;

  constructor(name?: string, isConstant: boolean = false) {
    this.name = name;
    this.upvalues = [];
    this.chunk = new Chunk();
    this.arity = 0;
    this.isConstant = isConstant;
  }

  asString(): string {
    return `<function ${this.name}>`;
  }
}

export default ObjFunction;
