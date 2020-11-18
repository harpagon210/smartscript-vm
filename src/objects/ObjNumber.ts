import Obj from './Obj';

class ObjNumber implements Obj {
  val: bigint;

  constructor(num: bigint) {
    this.val = num;
  }

  asString(): string {
    return `${this.val}`;
  }
}

export default ObjNumber;
