import Obj from './Obj';
import ObjClosure from './ObjClosure';

class ObjBoundMethod implements Obj {
  receiver: Obj;

  isConstant: boolean;

  method: ObjClosure;

  constructor(receiver: Obj, method: ObjClosure, isConstant: boolean = false) {
    this.receiver = receiver;
    this.isConstant = isConstant;
    this.method = method;
  }

  asString(): string {
    return `<boundmethod ${this.method.func.name}>`;
  }
}

export default ObjBoundMethod;
