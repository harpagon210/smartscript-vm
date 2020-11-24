import { VM, ObjNull, ObjNativeFunction, ObjInstance, ObjArray, ObjNumber } from "../src";

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
      const a = [];
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
      const a = new Array();
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

    let result: any;
    const setResultFn = () => {
      result = vm.pop();
      return new ObjNull();
    };
    vm.setGlobal('setResult', new ObjNativeFunction(setResultFn, 'setResult'));

    await vm.interpret(`
      const a = [];
      a.push(2);
      const t = a.pop();
      setResult(t);
    `)

    expect(result).toEqual(new ObjNumber(2n));
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

    let result: any;
    const setResultFn = () => {
      result = vm.pop();
      return new ObjNull();
    };
    vm.setGlobal('setResult', new ObjNativeFunction(setResultFn, 'setResult'));

    await vm.interpret(`
      const a = [];
      a.push(2);
      a.push(3);
      const t = a.shift();
      setResult(t);
    `)

    expect(result).toEqual(new ObjNumber(2n));
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
        expect(array.asString()).toEqual('array[1,2]');
      }
    }
  })
})
