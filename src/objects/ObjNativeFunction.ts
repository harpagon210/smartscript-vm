import Obj from './Obj';

class ObjNativeFunction implements Obj {
  func: Function;

  name: string;

  constructor(func: Function, name: string) {
    this.func = func;
    this.name = name;
  }

  asString(): string {
    return `<nativefunction ${this.name}>`;
  }
}

export default ObjNativeFunction;
