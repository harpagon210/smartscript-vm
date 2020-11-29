import Obj from './Obj';

class ObjNumber implements Obj {
  val: bigint;

  isConstant: boolean;

  constructor(num: bigint, isConstant: boolean = false) {
    this.val = num;
    this.isConstant = isConstant;
  }

  asString(): string {
    return `${this.val}`;
  }
}

export default ObjNumber;
