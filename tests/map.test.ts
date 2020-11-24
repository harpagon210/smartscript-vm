import { VM, ObjNull, ObjNativeFunction, ObjInstance, ObjString, ObjNativeClass, ObjBool } from "../src";

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
    const vm = new VM();

    let result: any;
    const setResultFn = () => {
      result = vm.pop();
      return new ObjNull();
    };
    vm.setGlobal('setResult', new ObjNativeFunction(setResultFn, 'setResult'));

    await vm.interpret(`
      const a = { testKey: 'testVal' };
      setResult(a.get('testKey'));
    `)

    expect(result).toEqual(new ObjString('testVal'))

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
      setResult(a['testKey']);
    `)

    expect(result2).toEqual(new ObjString('testVal'))
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
  })
})
