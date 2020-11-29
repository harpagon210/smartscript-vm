import Obj from './Obj';

class ObjBool implements Obj {
  val: boolean;

  isConstant: boolean;

  constructor(bool: boolean, isConstant: boolean = false) {
    this.val = bool;
    this.isConstant = isConstant;
  }

  asString(): string {
    return this.val === true ? 'true' : 'false';
  }
}

export default ObjBool;
