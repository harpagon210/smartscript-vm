import Obj from './Obj';

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
