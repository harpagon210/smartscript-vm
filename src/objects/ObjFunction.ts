import Obj from './Obj';
import UpValue from '../UpValue';
import Chunk from '../Chunk';
import ObjNumber from './ObjNumber';
import ObjString from './ObjString';

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

  serialize() {
    const serializedFunction: any = {};
    serializedFunction.name = this.name;
    serializedFunction.arity = this.arity;
    serializedFunction.isConstant = this.isConstant;
    serializedFunction.upvalues = this.upvalues;
    serializedFunction.lines = this.chunk.lines;
    serializedFunction.code = this.chunk.code;
    serializedFunction.constants = this.chunk.constants.map((constant) => {
      if (constant instanceof ObjNumber || constant instanceof ObjString) {
        return {
          type: constant.constructor.name,
          value: constant.val.toString(),
          isConstant: constant.isConstant,
        };
      }

      if (constant instanceof ObjFunction) {
        return {
          type: constant.constructor.name,
          value: constant.serialize(),
          isConstant: constant.isConstant,
        };
      }

      throw new Error(`type ${constant.constructor.name} not supported in ObjFunction serialize method.`);
    });

    return serializedFunction;
  }

  static deserialize(serializedFunction: any) {
    const objFunction = new ObjFunction();
    objFunction.name = serializedFunction.name;
    objFunction.arity = serializedFunction.arity;
    objFunction.isConstant = serializedFunction.isConstant;
    objFunction.upvalues = serializedFunction.upvalues
      .map((upvalue: any) => new UpValue(upvalue.index, upvalue.isLocal));

    const chunk = new Chunk();
    chunk.lines = serializedFunction.lines;
    chunk.code = serializedFunction.code;
    chunk.constants = serializedFunction.constants.map((constant: any) => {
      if (constant.type === 'ObjNumber') {
        return new ObjNumber(BigInt(constant.value), constant.isConstant);
      }

      if (constant.type === 'ObjString') {
        return new ObjString(constant.value, constant.isConstant);
      }

      if (constant.type === 'ObjFunction') {
        return ObjFunction.deserialize(constant.value);
      }

      throw new Error(`type ${constant.type} not supported in ObjFunction deserialize method.`);
    });

    objFunction.chunk = chunk;

    return objFunction;
  }
}

export default ObjFunction;
