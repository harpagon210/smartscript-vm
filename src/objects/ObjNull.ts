import Obj from './Obj';

class ObjNull implements Obj {
  val: null;

  isConstant: boolean;

  constructor() {
    this.val = null;
    this.isConstant = false;
  }

  // eslint-disable-next-line class-methods-use-this
  asString(): string {
    return 'null';
  }
}

export default ObjNull;
