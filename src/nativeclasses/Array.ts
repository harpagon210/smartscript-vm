import Obj from '../objects/Obj';
import ObjArray from '../objects/ObjArray';
import ObjInstance from '../objects/ObjInstance';
import ObjNativeClass from '../objects/ObjNativeClass';
import ObjNull from '../objects/ObjNull';
import ObjNumber from '../objects/ObjNumber';
// eslint-disable-next-line import/no-cycle
import VM from '../VM';

const ArrayClass = new ObjNativeClass('Array');

ArrayClass.asStringNative = (instance: ObjInstance) => {
  let output: string = 'Array [ ';
  const array = instance.getField('array');
  if (array instanceof ObjArray) {
    for (let index = 0; index < array.length(); index += 1) {
      if (index > 0) {
        output += ', ';
      }
      output += `${array.get(index).asString()}`;
    }
  }
  output += ' ]';
  return output;
};

ArrayClass.setMethod('constructor', (vm: VM, argCount: number) => {
  const instance = vm.stack[vm.stack.length - argCount - 1];
  if (instance instanceof ObjInstance && instance.klass.name === 'Array') {
    const arr = new Array(argCount);

    for (let index = argCount - 1; index >= 0; index -= 1) {
      const val = vm.peek(index);
      arr[index] = val;
    }

    instance.setField('array', new ObjArray(arr));

    return new ObjNull();
  }
  vm.runtimeError('Object is not an instance of Array');
  return false;
});

ArrayClass.setMethod('set', (vm: VM, argCount: number, index: Obj, value: Obj) => {
  const instance = vm.stack[vm.stack.length - argCount - 1];
  if (instance instanceof ObjInstance && instance.klass.name === 'Array') {
    if (!(index instanceof ObjNumber)) {
      vm.runtimeError(`Index ${index.asString()} is not number.`);
      return false;
    }
    const array = instance.getField('array');
    if (array instanceof ObjArray) {
      const arrIndexNum = (index as ObjNumber).val;

      if (arrIndexNum < 0 || arrIndexNum > array.length() - 1) {
        vm.runtimeError(`Out of bound ${arrIndexNum}.`);
        return false;
      }

      array.set(arrIndexNum, value);
      return new ObjNull();
    }
    vm.runtimeError('array is not an instance of ObjArray');
    return false;
  }
  vm.runtimeError('Object is not an instance of Array');
  return false;
});

ArrayClass.setMethod('get', (vm: VM, argCount: number, index: Obj) => {
  const instance = vm.stack[vm.stack.length - argCount - 1];

  if (instance instanceof ObjInstance && instance.klass.name === 'Array') {
    if (!(index instanceof ObjNumber)) {
      vm.runtimeError(`Index ${index.asString()} is not number.`);
      return false;
    }
    const array = instance.getField('array');
    if (array instanceof ObjArray) {
      const arrIndexNum = (index as ObjNumber).val;

      if (arrIndexNum < 0 || arrIndexNum > array.length() - 1) {
        vm.runtimeError(`Out of bound ${arrIndexNum}.`);
        return false;
      }

      return array.get(arrIndexNum);
    }
    vm.runtimeError('array is not an instance of ObjArray');
    return false;
  }
  vm.runtimeError('Object is not an instance of Array');
  return false;
});

ArrayClass.setMethod('push', (vm: VM, argCount: number, value: Obj) => {
  const instance = vm.stack[vm.stack.length - argCount - 1];

  if (instance instanceof ObjInstance && instance.klass.name === 'Array') {
    const array = instance.getField('array');
    if (array instanceof ObjArray) {
      array.push(value);
      return new ObjNull();
    }
    vm.runtimeError('array is not an instance of ObjArray');
    return false;
  }
  vm.runtimeError('Object is not an instance of Array');
  return false;
});

ArrayClass.setMethod('pop', (vm: VM, argCount: number) => {
  const instance = vm.stack[vm.stack.length - argCount - 1];
  if (instance instanceof ObjInstance && instance.klass.name === 'Array') {
    const array = instance.getField('array');
    if (array instanceof ObjArray) {
      const obj = array.pop();
      if (obj) {
        return obj;
      }
      return new ObjNull();
    }
    vm.runtimeError('array is not an instance of ObjArray');
    return false;
  }
  vm.runtimeError('Object is not an instance of Array');
  return false;
});

ArrayClass.setMethod('unshift', (vm: VM, argCount: number, value: Obj) => {
  const instance = vm.stack[vm.stack.length - argCount - 1];

  if (instance instanceof ObjInstance && instance.klass.name === 'Array') {
    const array = instance.getField('array');
    if (array instanceof ObjArray) {
      array.unshift(value);
      return new ObjNull();
    }
    vm.runtimeError('array is not an instance of ObjArray');
    return false;
  }
  vm.runtimeError('Object is not an instance of Array');
  return false;
});

ArrayClass.setMethod('shift', (vm: VM, argCount: number) => {
  const instance = vm.stack[vm.stack.length - argCount - 1];
  if (instance instanceof ObjInstance && instance.klass.name === 'Array') {
    const array = instance.getField('array');
    if (array instanceof ObjArray) {
      const obj = array.shift();
      if (obj) {
        return obj;
      }
      return new ObjNull();
    }

    vm.runtimeError('array is not an instance of ObjArray');
    return false;
  }
  vm.runtimeError('Object is not an instance of Array');
  return false;
});

ArrayClass.setMethod('clear', (vm: VM, argCount: number) => {
  const instance = vm.stack[vm.stack.length - argCount - 1];
  if (instance instanceof ObjInstance && instance.klass.name === 'Array') {
    const array = instance.getField('array');
    if (array instanceof ObjArray) {
      array.clear();
      return new ObjNull();
    }

    vm.runtimeError('array is not an instance of ObjArray');
    return false;
  }
  vm.runtimeError('Object is not an instance of Array');
  return false;
});

export default ArrayClass;
