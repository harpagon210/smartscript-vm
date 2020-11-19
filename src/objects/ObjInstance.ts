import Obj from './Obj';
import ObjClass from './ObjClass';
// eslint-disable-next-line import/no-cycle
import ObjNativeClass from './ObjNativeClass';

class ObjInstance implements Obj {
  klass: ObjClass | ObjNativeClass;

  fields: Map<string, Obj>;

  constructor(klass: ObjClass | ObjNativeClass) {
    this.klass = klass;
    this.fields = new Map();
  }

  asString(): string {
    if (this.klass instanceof ObjNativeClass) {
      return this.klass.asStringNative(this);
    }
    return `<${this.klass.name} instance>`;
  }

  getField(key: string): Obj {
    return this.fields.get(key);
  }

  deleteField(key: string): boolean {
    return this.fields.delete(key);
  }

  setField(key: string, value: Obj): boolean {
    const isNewKey = !this.fields.has(key);
    this.fields.set(key, value);
    return isNewKey;
  }
}

export default ObjInstance;
