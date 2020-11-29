import Obj from './Obj';
import ObjFunction from './ObjFunction';
import ObjUpValue from './ObjUpValue';

class ObjClosure implements Obj {
  func: ObjFunction;

  isConstant: boolean;

  upvalues: Array<ObjUpValue>;

  constructor(func: ObjFunction, isConstant: boolean = false) {
    this.func = func;
    this.isConstant = isConstant;

    this.upvalues = [];

    for (let i = 0; i < func.upvalues.length; i += 1) {
      this.upvalues[i] = null;
    }
  }

  asString(): string {
    if (!this.func.name) {
      return '<closure main script>';
    }
    return `<closure ${this.func.name}>`;
  }
}

export default ObjClosure;
