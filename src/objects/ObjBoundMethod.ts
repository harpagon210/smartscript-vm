import Obj from './Obj';
import ObjClosure from './ObjClosure';

class ObjBoundMethod implements Obj {
  receiver: Obj;

  method: ObjClosure;

  constructor(receiver: Obj, method: ObjClosure) {
    this.receiver = receiver;
    this.method = method;
  }

  asString(): string {
    return `<boundmethod ${this.method.func.name}>`;
  }
}

export default ObjBoundMethod;
