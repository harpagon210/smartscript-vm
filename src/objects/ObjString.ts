import Obj from './Obj';

class ObjString implements Obj {
  val: string;

  isConstant: boolean;

  constructor(str: string, isConstant: boolean = false) {
    this.val = str;
    this.isConstant = isConstant;
  }

  asString(): string {
    return this.val;
  }
}

export default ObjString;
