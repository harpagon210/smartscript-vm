import Obj from './Obj';

class ObjNull implements Obj {
  val: null;

  constructor() {
    this.val = null;
  }

  // eslint-disable-next-line class-methods-use-this
  asString(): string {
    return 'null';
  }
}

export default ObjNull;
