import { VM, ObjNull, ObjNativeFunction, ObjInstance, ObjArray, ObjNumber, ArrayClass, MapClass, ObjString, InterpretResult } from "../src";

describe('array', () => {

  it('should create an instance of Array', async () => {
    const vm = new VM();

    let result: any;
    const setResultFn = () => {
      result = vm.pop();
      return new ObjNull();
    };
    vm.setGlobal('setResult', new ObjNativeFunction(setResultFn, 'setResult'));

    await vm.interpret(`
      const a = [1, 2];
      setResult(a);
    `)

    expect(result instanceof ObjInstance).toBeTruthy();
    if (result instanceof ObjInstance) {
      expect(result.klass.name).toEqual('Array');
    }

    const vm2 = new VM();

    let result2: any;
    const setResultFn2 = () => {
      result2 = vm2.pop();
      return new ObjNull();
    };
    vm2.setGlobal('setResult', new ObjNativeFunction(setResultFn2, 'setResult'));

    await vm2.interpret(`
      const a = new Array(1, 2);
      setResult(a);
    `)

    expect(result2 instanceof ObjInstance).toBeTruthy();
    if (result2 instanceof ObjInstance) {
      expect(result2.klass.name).toEqual('Array');
    }
  })

  it('should set a value', async () => {
    const vm = new VM();

    let result: any;
    const setResultFn = () => {
      result = vm.pop();
      return new ObjNull();
    };
    vm.setGlobal('setResult', new ObjNativeFunction(setResultFn, 'setResult'));

    await vm.interpret(`
      const a = [];
      a.push(1);
      a.set(0, 2);
      setResult(a);
    `)

    expect(result instanceof ObjInstance).toBeTruthy();
    if (result instanceof ObjInstance) {
      const array = result.getField('array');
      expect(array instanceof ObjArray).toBeTruthy();
      if (array instanceof ObjArray) {
        expect(array.get(0)).toEqual(new ObjNumber(2n));
      }
    }

    const vm2 = new VM();

    let result2: any;
    const setResultFn2 = () => {
      result2 = vm2.pop();
      return new ObjNull();
    };
    vm2.setGlobal('setResult', new ObjNativeFunction(setResultFn2, 'setResult'));

    await vm2.interpret(`
      const a = [];
      a.push(1);
      a[0] = 2;
      setResult(a);
    `)

    expect(result2 instanceof ObjInstance).toBeTruthy();
    if (result2 instanceof ObjInstance) {
      const array = result2.getField('array');
      expect(array instanceof ObjArray).toBeTruthy();
      if (array instanceof ObjArray) {
        expect(array.get(0)).toEqual(new ObjNumber(2n));
      }
    }
  })

  it('should detect out ouf bound', async () => {
    let vm = new VM();

    let result = await vm.interpret(`
      const a = [];
      a.set(1, 2);
    `)

    expect(result.result).toEqual(InterpretResult.InterpretRuntimeError);
    expect(result.stackTrace).toEqual(`runtime exception: Out of bound 1.
[line 2] in main script`);

    vm = new VM();

    result = await vm.interpret(`
      const a = [];
      a.get(1);
    `)

    expect(result.result).toEqual(InterpretResult.InterpretRuntimeError);
    expect(result.stackTrace).toEqual(`runtime exception: Out of bound 1.
[line 2] in main script`);

  })

  it('should push a value', async () => {
    const vm = new VM();

    let result: any;
    const setResultFn = () => {
      result = vm.pop();
      return new ObjNull();
    };
    vm.setGlobal('setResult', new ObjNativeFunction(setResultFn, 'setResult'));

    await vm.interpret(`
      const a = [];
      a.push(2);
      setResult(a);
    `)

    expect(result instanceof ObjInstance).toBeTruthy();
    if (result instanceof ObjInstance) {
      const array = result.getField('array');
      expect(array instanceof ObjArray).toBeTruthy();
      if (array instanceof ObjArray) {
        expect(array.get(0)).toEqual(new ObjNumber(2n));
      }
    }
  })

  it('should pop a value', async () => {
    const vm = new VM();

    let results: Array<any> = [];
    const addResultFn = () => {
      results.push(vm.pop());
      return new ObjNull();
    };
    vm.setGlobal('addResult', new ObjNativeFunction(addResultFn, 'addResult'));

    await vm.interpret(`
      const a = [];
      a.push(2);
      addResult(a.pop());
      addResult(a.pop());
    `)

    expect(results[0]).toEqual(new ObjNumber(2n));
    expect(results[1]).toEqual(new ObjNull());
  })

  it('should unshift a value', async () => {
    const vm = new VM();

    let result: any;
    const setResultFn = () => {
      result = vm.pop();
      return new ObjNull();
    };
    vm.setGlobal('setResult', new ObjNativeFunction(setResultFn, 'setResult'));

    await vm.interpret(`
      const a = [];
      a.push(2);
      a.unshift(3);
      const t = a[0];
      setResult(t);
    `)

    expect(result).toEqual(new ObjNumber(3n));
  })

  it('should shift a value', async () => {
    const vm = new VM();

    let results: Array<any> = [];
    const addResultFn = () => {
      results.push(vm.pop());
      return new ObjNull();
    };
    vm.setGlobal('addResult', new ObjNativeFunction(addResultFn, 'addResult'));

    await vm.interpret(`
      const a = [];
      a.push(2);
      a.push(3);
      addResult(a.shift());
      addResult(a.shift());
      addResult(a.shift());
    `)

    expect(results[0]).toEqual(new ObjNumber(2n));
    expect(results[1]).toEqual(new ObjNumber(3n));
    expect(results[2]).toEqual(new ObjNull());
  })

  it('should clear a array', async () => {
    const vm = new VM();

    let result: any;
    const setResultFn = () => {
      result = vm.pop();
      return new ObjNull();
    };
    vm.setGlobal('setResult', new ObjNativeFunction(setResultFn, 'setResult'));

    await vm.interpret(`
      const a = [];
      a.push(2);
      a.clear();
      setResult(a);
    `)

    expect(result instanceof ObjInstance).toBeTruthy();
    if (result instanceof ObjInstance) {
      const array = result.getField('array');
      expect(array instanceof ObjArray).toBeTruthy();
      if (array instanceof ObjArray) {
        expect(array.length()).toEqual(0);
      }
    }
  })

  it('should print an array', async () => {
    const vm = new VM();

    let result: any;
    const setResultFn = () => {
      result = vm.pop();
      return new ObjNull();
    };
    vm.setGlobal('setResult', new ObjNativeFunction(setResultFn, 'setResult'));

    await vm.interpret(`
      const a = [1, 2];
      print(a);
      setResult(a);
    `)

    expect(result instanceof ObjInstance).toBeTruthy();
    if (result instanceof ObjInstance) {
      const array = result.getField('array');
      expect(array instanceof ObjArray).toBeTruthy();
      if (array instanceof ObjArray) {
        expect(array.asString()).toEqual('Array [ 1, 2 ]');
      }
    }
  })

  it('can only call methods on an instance of Array', async () => {
    let vm = new VM();
    const setMethod = ArrayClass.getMethod('set');
    const mapInstance = new ObjInstance(MapClass);
    const index = new ObjNumber(0n);
    const val = new ObjString('testVal');
    vm.stack.push(mapInstance);
    vm.stack.push(index);
    vm.stack.push(val);
    let result = setMethod(vm, 2, index, val);

    expect(result).toBeFalsy();
    expect(vm.stackTrace).toEqual('runtime exception: Object is not an instance of Array');

    vm = new VM();
    let arrayInstance = new ObjInstance(ArrayClass);
    arrayInstance.setField('array', new ObjNull())
    vm.stack.push(arrayInstance);
    vm.stack.push(index);
    result = setMethod(vm, 1, index, val);

    expect(result).toBeFalsy();
    expect(vm.stackTrace).toEqual('runtime exception: array is not an instance of ObjArray');

    vm = new VM();
    const getMethod = ArrayClass.getMethod('get');
    vm.stack.push(mapInstance);
    vm.stack.push(index);
    result = getMethod(vm, 1, index);

    expect(result).toBeFalsy();
    expect(vm.stackTrace).toEqual('runtime exception: Object is not an instance of Array');

    vm = new VM();
    arrayInstance = new ObjInstance(ArrayClass);
    arrayInstance.setField('array', new ObjNull())
    vm.stack.push(arrayInstance);
    vm.stack.push(index);
    result = getMethod(vm, 1, index);

    expect(result).toBeFalsy();
    expect(vm.stackTrace).toEqual('runtime exception: array is not an instance of ObjArray');

    vm = new VM();
    const ctorMethod = ArrayClass.getMethod('constructor');
    vm.stack.push(mapInstance);
    vm.stack.push(index);
    result = ctorMethod(vm, 1);

    expect(result).toBeFalsy();
    expect(vm.stackTrace).toEqual('runtime exception: Object is not an instance of Array');

    vm = new VM();
    const pushMethod = ArrayClass.getMethod('push');
    vm.stack.push(mapInstance);
    vm.stack.push(new ObjNull());
    result = pushMethod(vm, 1);

    expect(result).toBeFalsy();
    expect(vm.stackTrace).toEqual('runtime exception: Object is not an instance of Array');

    vm = new VM();
    arrayInstance = new ObjInstance(ArrayClass);
    arrayInstance.setField('array', new ObjNull())
    vm.stack.push(arrayInstance);
    vm.stack.push(val);
    result = pushMethod(vm, 1, val);

    expect(result).toBeFalsy();
    expect(vm.stackTrace).toEqual('runtime exception: array is not an instance of ObjArray');

    vm = new VM();
    const popMethod = ArrayClass.getMethod('pop');
    vm.stack.push(mapInstance);
    result = popMethod(vm, 0);

    expect(result).toBeFalsy();
    expect(vm.stackTrace).toEqual('runtime exception: Object is not an instance of Array');

    vm = new VM();
    arrayInstance = new ObjInstance(ArrayClass);
    arrayInstance.setField('array', new ObjNull())
    vm.stack.push(arrayInstance);
    result = popMethod(vm, 0);

    expect(result).toBeFalsy();
    expect(vm.stackTrace).toEqual('runtime exception: array is not an instance of ObjArray');

    vm = new VM();
    const unshiftMethod = ArrayClass.getMethod('unshift');
    vm.stack.push(mapInstance);
    vm.stack.push(new ObjNull());
    result = unshiftMethod(vm, 1);

    expect(result).toBeFalsy();
    expect(vm.stackTrace).toEqual('runtime exception: Object is not an instance of Array');

    vm = new VM();
    arrayInstance = new ObjInstance(ArrayClass);
    arrayInstance.setField('array', new ObjNull())
    vm.stack.push(arrayInstance);
    vm.stack.push(val);
    result = unshiftMethod(vm, 1, val);

    expect(result).toBeFalsy();
    expect(vm.stackTrace).toEqual('runtime exception: array is not an instance of ObjArray');

    vm = new VM();
    const shiftMethod = ArrayClass.getMethod('shift');
    vm.stack.push(mapInstance);
    result = shiftMethod(vm, 0);

    expect(result).toBeFalsy();
    expect(vm.stackTrace).toEqual('runtime exception: Object is not an instance of Array');

    vm = new VM();
    arrayInstance = new ObjInstance(ArrayClass);
    arrayInstance.setField('array', new ObjNull())
    vm.stack.push(arrayInstance);
    result = shiftMethod(vm, 0);

    vm = new VM();
    const clearMethod = ArrayClass.getMethod('clear');
    vm.stack.push(mapInstance);
    result = clearMethod(vm, 0);

    expect(result).toBeFalsy();
    expect(vm.stackTrace).toEqual('runtime exception: Object is not an instance of Array');

    vm = new VM();
    arrayInstance = new ObjInstance(ArrayClass);
    arrayInstance.setField('array', new ObjNull())
    vm.stack.push(arrayInstance);
    result = clearMethod(vm, 0);

    expect(result).toBeFalsy();
    expect(vm.stackTrace).toEqual('runtime exception: array is not an instance of ObjArray');
  })

  it('index must be an ObjNumber', async () => {
    let vm = new VM();
    const setMethod = ArrayClass.getMethod('set');
    const instance = new ObjInstance(ArrayClass);
    const index = new ObjString('testIndex');
    const val = new ObjString('testVal');
    vm.stack.push(instance);
    vm.stack.push(index);
    vm.stack.push(val);
    let result = setMethod(vm, 2, index, val);

    expect(result).toBeFalsy();
    expect(vm.stackTrace).toEqual('runtime exception: Index testIndex is not number.');

    vm = new VM();
    const getMethod = ArrayClass.getMethod('get');
    vm.stack.push(instance);
    vm.stack.push(index);
    vm.stack.push(val);
    result = getMethod(vm, 2, index);

    expect(result).toBeFalsy();
    expect(vm.stackTrace).toEqual('runtime exception: Index testIndex is not number.');
  })
})
