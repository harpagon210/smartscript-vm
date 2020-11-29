import Obj from './Obj';
// eslint-disable-next-line import/no-cycle
import ObjInstance from './ObjInstance';

class ObjNativeClass implements Obj {
  name: string;

  isConstant: boolean;

  methods: Map<string, Function>;

  constructor(name: string, isConstant: boolean = false) {
    this.name = name;
    this.isConstant = isConstant;
    this.methods = new Map();
  }

  asString(): string {
    return `<nativeclass ${this.name}>`;
  }

  // @ts-ignore this method has to be overriden by the native class
  // eslint-disable-next-line class-methods-use-this
  asStringNative(instance: ObjInstance): string {
    throw new Error(`asStringNative() to be implemented on ${instance.klass.name}`);
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
