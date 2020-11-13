import Obj from './Obj';

class ObjString implements Obj {
  val: string;

  constructor(str: string) {
    this.val = str;
  }

  asString(): string {
    return this.val;
  }
}

export default ObjString;
