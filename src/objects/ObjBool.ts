import Obj from './Obj';

class ObjBool implements Obj {
  val: boolean;

  constructor(bool: boolean) {
    this.val = bool;
  }

  asString(): string {
    return this.val === true ? 'true' : 'false';
  }
}

export default ObjBool;
