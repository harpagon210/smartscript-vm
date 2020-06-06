import Obj from './Obj';

class ObjNumber implements Obj {
  val: number;

  constructor(num: number) {
    this.val = num;
  }

  asString(): string {
    return `${this.val}`;
  }
}

export default ObjNumber;
