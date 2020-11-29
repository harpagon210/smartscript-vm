import Obj from './Obj';

class ObjNativeFunction implements Obj {
  func: Function;

  name: string;

  isConstant: boolean;

  constructor(func: Function, name: string, isConstant: boolean = false) {
    this.func = func;
    this.name = name;
    this.isConstant = isConstant;
  }

  asString(): string {
    return `<nativefunction ${this.name}>`;
  }
}

export default ObjNativeFunction;
