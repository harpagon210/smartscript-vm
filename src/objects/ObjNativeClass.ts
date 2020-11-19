import Obj from './Obj';
import ObjInstance from './ObjInstance';

class ObjNativeClass implements Obj {
  name: string;

  methods: Map<string, Function>;

  constructor(name: string) {
    this.name = name;
    this.methods = new Map();
  }

  asString(): string {
    return `<nativeclass ${this.name}>`;
  }

  //@ts-ignore this method has to be overriden by the native class
  asStringNative(instance: ObjInstance): string {
    throw new Error(`asStringNative to be implemented for ObjNativeClass: ${this.name}`)
    return `<nativeclass ${this.name}>`;
  }

  getMethod(key: string): Function {
    return this.methods.get(key);
  }

  setMethod(key: string, value: Function): boolean {
    const isNewKey = !this.methods.has(key);
    this.methods.set(key, value);
    return isNewKey;
  }
}

export default ObjNativeClass;
