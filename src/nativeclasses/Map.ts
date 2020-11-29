import Obj from '../objects/Obj';
import ObjBool from '../objects/ObjBool';
import ObjInstance from '../objects/ObjInstance';
import ObjNativeClass from '../objects/ObjNativeClass';
import ObjNull from '../objects/ObjNull';
// eslint-disable-next-line import/no-cycle
import VM from '../VM';

const MapClass = new ObjNativeClass('Map', true);

MapClass.asStringNative = (instance: ObjInstance) => {
  let output: string = 'Map { ';

  let first = true;
  instance.fields.forEach((val, key) => {
    if (first) {
      output += `${key}: ${val.asString()}`;
      first = false;
    } else {
      output += `, ${key}: ${val.asString()}`;
    }
  });

  output += ' }';
  return output;
};

MapClass.setMethod('set', (vm: VM, argCount: number, key: Obj, value: Obj) => {
  const instance = vm.stack[vm.stack.length - argCount - 1];
  if (instance instanceof ObjInstance && instance.klass.name === 'Map') {
    instance.setField(key.asString(), value);
    return new ObjNull();
  }
  vm.runtimeError('Object is not an instance of Map');
  return false;
});

MapClass.setMethod('get', (vm: VM, argCount: number, key: Obj) => {
  const instance = vm.stack[vm.stack.length - argCount - 1];
  if (instance instanceof ObjInstance && instance.klass.name === 'Map') {
    const name = key.asString();
    const val = instance.getField(name);
    if (val) {
      return val;
    }
    vm.runtimeError(`Undefined property '${name}'.`);
    return false;
  }
  vm.runtimeError('Object is not an instance of Map');
  return false;
});

MapClass.setMethod('delete', (vm: VM, argCount: number, key: Obj) => {
  const instance = vm.stack[vm.stack.length - argCount - 1];
  if (instance instanceof ObjInstance && instance.klass.name === 'Map') {
    const name = key.asString();
    return instance.deleteField(name);
  }
  vm.runtimeError('Object is not an instance of Map');
  return false;
});

MapClass.setMethod('has', (vm: VM, argCount: number, key: Obj) => {
  const instance = vm.stack[vm.stack.length - argCount - 1];
  if (instance instanceof ObjInstance && instance.klass.name === 'Map') {
    return new ObjBool(instance.fields.has(key.asString()));
  }
  vm.runtimeError('Object is not an instance of Map');
  return false;
});

MapClass.setMethod('clear', (vm: VM, argCount: number) => {
  const instance = vm.stack[vm.stack.length - argCount - 1];
  if (instance instanceof ObjInstance && instance.klass.name === 'Map') {
    instance.fields.clear();
    return new ObjNull();
  }
  vm.runtimeError('Object is not an instance of Map');
  return false;
});

export default MapClass;
