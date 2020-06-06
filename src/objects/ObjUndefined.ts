import Obj from './Obj';

class ObjUndefined implements Obj {
  val: undefined;

  constructor() {
    this.val = undefined;
  }

  asString(): string {
    return `${this.val}`;
  }
}

export default ObjUndefined;
