import Obj from './Obj';
import ObjClass from './ObjClass';
// eslint-disable-next-line import/no-cycle
import ObjNativeClass from './ObjNativeClass';

class ObjInstance implements Obj {
  klass: ObjClass | ObjNativeClass;

  fields: Map<string, Obj>;

  isConstant: boolean;

  constructor(klass: ObjClass | ObjNativeClass, isConstant: boolean = false) {
    this.klass = klass;
    this.fields = new Map();
    this.isConstant = isConstant;
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

  setField(key: string, value: Obj): { isNewKey: boolean, error: boolean } {
    const originalObj = this.fields.get(key);
    const isNewKey = originalObj === undefined;

    if (originalObj && originalObj.isConstant === true) {
      return { isNewKey, error: true };
    }
    this.fields.set(key, value);
    return { isNewKey, error: false };
  }
}

export default ObjInstance;
