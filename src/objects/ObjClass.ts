import Obj from './Obj';
import ObjClosure from './ObjClosure';

class ObjClass implements Obj {
  name: string;

  isConstant: boolean;

  methods: Map<string, ObjClosure>;

  constructor(name: string, isConstant: boolean = false) {
    this.name = name;
    this.isConstant = isConstant;
    this.methods = new Map();
  }

  asString(): string {
    return `<class ${this.name}>`;
  }

  getMethod(key: string): ObjClosure {
    return this.methods.get(key);
  }

  setMethod(key: string, value: ObjClosure): boolean {
    const isNewKey = !this.methods.has(key);
    this.methods.set(key, value);
    return isNewKey;
  }
}

export default ObjClass;
