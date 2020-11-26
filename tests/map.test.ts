import { VM, ObjNull, ObjNativeFunction, ObjInstance, ObjString, ObjNativeClass, ObjBool, MapClass, ArrayClass, InterpretResult } from "../src";

describe('map', () => {

  it('should create an instance of Map', async () => {
    const vm = new VM();

    let result: any;
    const setResultFn = () => {
      result = vm.pop();
      return new ObjNull();
    };
    vm.setGlobal('setResult', new ObjNativeFunction(setResultFn, 'setResult'));

    await vm.interpret(`
      const a = {};
      setResult(a);
    `)

    expect(result instanceof ObjInstance).toBeTruthy();
    if (result instanceof ObjInstance) {
      expect(result.klass.name).toEqual('Map');
    }

    const vm2 = new VM();

    let result2: any;
    const setResultFn2 = () => {
      result2 = vm2.pop();
      return new ObjNull();
    };
    vm2.setGlobal('setResult', new ObjNativeFunction(setResultFn2, 'setResult'));

    await vm2.interpret(`
      const a = new Map();
      setResult(a);
    `)

    expect(result2 instanceof ObjInstance).toBeTruthy();
    if (result2 instanceof ObjInstance) {
      expect(result2.klass.name).toEqual('Map');
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
      const a = { testKey: 'testVal' };
      setResult(a);
    `)

    expect(result instanceof ObjInstance).toBeTruthy();
    if (result instanceof ObjInstance) {
      expect(result.getField('testKey')).toEqual(new ObjString('testVal'))
    }

    const vm2 = new VM();

    let result2: any;
    const setResultFn2 = () => {
      result2 = vm2.pop();
      return new ObjNull();
    };
    vm2.setGlobal('setResult', new ObjNativeFunction(setResultFn2, 'setResult'));

    await vm2.interpret(`
      const a = new Map();
      a.set('testKey', 'testVal');
      setResult(a);
    `)

    expect(result2 instanceof ObjInstance).toBeTruthy();
    if (result2 instanceof ObjInstance) {
      expect(result2.getField('testKey')).toEqual(new ObjString('testVal'))
    }

    const vm3 = new VM();

    let result3: any;
    const setResultFn3 = () => {
      result3 = vm3.pop();
      return new ObjNull();
    };
    vm3.setGlobal('setResult', new ObjNativeFunction(setResultFn3, 'setResult'));

    await vm3.interpret(`
      const a = new Map();
      a['testKey'] = 'testVal';
      setResult(a);
    `)

    expect(result3 instanceof ObjInstance).toBeTruthy();
    if (result3 instanceof ObjInstance) {
      expect(result3.getField('testKey')).toEqual(new ObjString('testVal'))
    }
  })

  it('should get a value', async () => {
    let vm = new VM();

    let result: any;
    let setResultFn = () => {
      result = vm.pop();
      return new ObjNull();
    };
    vm.setGlobal('setResult', new ObjNativeFunction(setResultFn, 'setResult'));

    await vm.interpret(`
      const a = { testKey: 'testVal' };
      setResult(a.get('testKey'));
    `)

    expect(result).toEqual(new ObjString('testVal'))

    vm = new VM();

    result = [];
    setResultFn = () => {
      result = vm.pop();
      return new ObjNull();
    };
    vm.setGlobal('setResult', new ObjNativeFunction(setResultFn, 'setResult'));

    await vm.interpret(`
      const a = new Map();
      a.set('testKey', 'testVal');
      setResult(a['testKey']);
    `)

    expect(result).toEqual(new ObjString('testVal'))

    vm = new VM();

    result = [];
    setResultFn = () => {
      result = vm.pop();
      return new ObjNull();
    };
    vm.setGlobal('setResult', new ObjNativeFunction(setResultFn, 'setResult'));

    await vm.interpret(`
      const a = { 'test'+'Key': 'testVal' };
      setResult(a['testKey']);
    `)

    expect(result).toEqual(new ObjString('testVal'))
  })

  it('should not get a value', async () => {
    const vm = new VM();

    const result = await vm.interpret(`
      const a = { testKey: 'testVal' };
      a.get('testKey2');
    `)

    expect(result.result).toEqual(InterpretResult.InterpretRuntimeError);
    expect(result.errors).toEqual(`runtime exception: Undefined property 'testKey2'.
[line 2] in main script`);
  })

  it('should check if the Map has a value', async () => {
    const vm = new VM();

    let result: any;
    const setResultFn = () => {
      result = vm.pop();
      return new ObjNull();
    };
    vm.setGlobal('setResult', new ObjNativeFunction(setResultFn, 'setResult'));

    await vm.interpret(`
      const a = { testKey: 'testVal' };
      setResult(a.has('testKey'));
    `)

    expect(result).toEqual(new ObjBool(true))

    const vm2 = new VM();

    let result2: any;
    const setResultFn2 = () => {
      result2 = vm2.pop();
      return new ObjNull();
    };
    vm2.setGlobal('setResult', new ObjNativeFunction(setResultFn2, 'setResult'));

    await vm2.interpret(`
      const a = new Map();
      a.set('testKey', 'testVal');
      setResult(a.has('testKey2'));
    `)

    expect(result2).toEqual(new ObjBool(false))
  })

  it('should delete a key', async () => {
    const vm = new VM();

    let result: any;
    const setResultFn = () => {
      result = vm.pop();
      return new ObjNull();
    };
    vm.setGlobal('setResult', new ObjNativeFunction(setResultFn, 'setResult'));

    await vm.interpret(`
      const a = { testKey: 'testVal' };
      a.delete('testKey');
      setResult(a.has('testKey'));
    `)

    expect(result).toEqual(new ObjBool(false))
  })

  it('should clear a Map', async () => {
    const vm = new VM();

    let result: any;
    const setResultFn = () => {
      result = vm.pop();
      return new ObjNull();
    };
    vm.setGlobal('setResult', new ObjNativeFunction(setResultFn, 'setResult'));

    await vm.interpret(`
      const a = { testKey: 'testVal', testKey2: 'testVal2' };
      a.clear();
      setResult(a.has('testKey2'));
    `)

    expect(result).toEqual(new ObjBool(false))
  })

  it('should print a map', async () => {
    const vm = new VM();

    let result: any;
    const setResultFn = () => {
      result = vm.pop();
      return new ObjNull();
    };
    vm.setGlobal('setResult', new ObjNativeFunction(setResultFn, 'setResult'));

    await vm.interpret(`
      const a = new Map();
      a['testKey'] = 'testVal';
      setResult(a);
    `)

    expect(result instanceof ObjInstance).toBeTruthy();
    if (result instanceof ObjInstance) {
      expect((result.klass as ObjNativeClass).asStringNative(result)).toEqual('Map { testKey: testVal }');
    }

    const vm2 = new VM();

    let result2: any;
    const setResultFn2 = () => {
      result2 = vm2.pop();
      return new ObjNull();
    };
    vm2.setGlobal('setResult', new ObjNativeFunction(setResultFn2, 'setResult'));

    await vm2.interpret(`
      const a = new Map();
      a['testKey'] = 'testVal';
      a['testKey2'] = 'testVal2';
      setResult(a);
    `)

    expect(result2 instanceof ObjInstance).toBeTruthy();
    if (result2 instanceof ObjInstance) {
      expect((result2.klass as ObjNativeClass).asStringNative(result2)).toEqual('Map { testKey: testVal, testKey2: testVal2 }');
    }
  })

  it('should print a native class', async () => {
    const vm = new VM();

    await vm.interpret(`1;`)

    const nativeClass = vm.getGlobal('Map');
    expect(nativeClass instanceof ObjNativeClass).toBeTruthy();
    if (nativeClass instanceof ObjNativeClass) {
      expect(nativeClass.asString()).toEqual('<nativeclass Map>');
    }

    const nativeCl = new ObjNativeClass('test');
    const nativeInst = new ObjInstance(nativeCl);
    let error: Error;
    try {
      nativeCl.asStringNative(nativeInst)
    } catch (err) {
      error = err;
    }

    expect(error.message).toEqual('asStringNative() to be implemented on test');
  })

  it('can only call methods on an instance of Map', async () => {
    let vm = new VM();
    const setMethod = MapClass.getMethod('set');
    const instance = new ObjInstance(ArrayClass);
    const key = new ObjString('testKey');
    const val = new ObjString('testVal');
    vm.stack.push(instance);
    vm.stack.push(key);
    vm.stack.push(val);
    let result = setMethod(vm, 2, key, val);

    expect(result).toBeFalsy();
    expect(vm.errors).toEqual('runtime exception: Object is not an instance of Map');

    vm = new VM();
    const getMethod = MapClass.getMethod('get');
    vm.stack.push(instance);
    vm.stack.push(key);
    result = getMethod(vm, 1, key);

    expect(result).toBeFalsy();
    expect(vm.errors).toEqual('runtime exception: Object is not an instance of Map');

    vm = new VM();
    const deleteMethod = MapClass.getMethod('delete');
    vm.stack.push(instance);
    vm.stack.push(key);
    result = deleteMethod(vm, 1, key);

    expect(result).toBeFalsy();
    expect(vm.errors).toEqual('runtime exception: Object is not an instance of Map');

    vm = new VM();
    const hasMethod = MapClass.getMethod('has');
    vm.stack.push(instance);
    vm.stack.push(key);
    result = hasMethod(vm, 1, key);

    expect(result).toBeFalsy();
    expect(vm.errors).toEqual('runtime exception: Object is not an instance of Map');

    vm = new VM();
    const clearMethod = MapClass.getMethod('clear');
    vm.stack.push(instance);
    result = clearMethod(vm, 0);

    expect(result).toBeFalsy();
    expect(vm.errors).toEqual('runtime exception: Object is not an instance of Map');
  })
})
