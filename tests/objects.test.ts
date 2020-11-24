import { ObjBool, ObjNativeFunction, ObjNull, ObjNumber, ObjString, VM } from "../src";

describe('objects', () => {
  it('should create an ObjBool true', async () => {
    const vm = new VM();

    let result: any;
    const setResultFn = () => {
      result = vm.pop();
      return new ObjNull();
    };
    vm.setGlobal('setResult', new ObjNativeFunction(setResultFn, 'setResult'));

    await vm.interpret(`
      const a = true;
      print(a);
      setResult(a);
    `)

    expect(result).toEqual(new ObjBool(true));
  })

  it('should create an ObjBool false', async () => {
    const vm = new VM();

    let result: any;
    const setResultFn = () => {
      result = vm.pop();
      return new ObjNull();
    };
    vm.setGlobal('setResult', new ObjNativeFunction(setResultFn, 'setResult'));

    await vm.interpret(`
      const a = false;
      print(a);
      setResult(a);
    `)

    expect(result).toEqual(new ObjBool(false));
  })

  it('should create an ObjNull', async () => {
    const vm = new VM();

    let result: any;
    const setResultFn = () => {
      result = vm.pop();
      return new ObjNull();
    };
    vm.setGlobal('setResult', new ObjNativeFunction(setResultFn, 'setResult'));

    await vm.interpret(`
      const a = null;
      print(a);
      setResult(a);
    `)

    expect(result).toEqual(new ObjNull());
  })

  it('should create an ObjString', async () => {
    const vm = new VM();

    let result: any;
    const setResultFn = () => {
      result = vm.pop();
      return new ObjNull();
    };
    vm.setGlobal('setResult', new ObjNativeFunction(setResultFn, 'setResult'));

    await vm.interpret(`
      const a = 'test';
      print(a);
      setResult(a);
    `)

    expect(result).toEqual(new ObjString('test'));

    const vm2 = new VM();

    let result2: any;
    const setResultFn2 = () => {
      result2 = vm2.pop();
      return new ObjNull();
    };
    vm2.setGlobal('setResult', new ObjNativeFunction(setResultFn2, 'setResult'));

    await vm2.interpret(`
      const a = "test";
      print(a);
      setResult(a);
    `)

    expect(result2).toEqual(new ObjString('test'));
  })

  it('should create an ObjNumber', async () => {
    const vm = new VM();

    let result: any;
    const setResultFn = () => {
      result = vm.pop();
      return new ObjNull();
    };
    vm.setGlobal('setResult', new ObjNativeFunction(setResultFn, 'setResult'));

    await vm.interpret(`
      const a = 1;
      print(a);
      setResult(a);
    `)

    expect(result).toEqual(new ObjNumber(1n));
  })

  it('should create a native function', async () => {
    const vm = new VM();

    let result: any;
    const setResultFn = () => {
      result = vm.pop();
      return new ObjNull();
    };
    vm.setGlobal('setResult', new ObjNativeFunction(setResultFn, 'setResult'));

    await vm.interpret(`
      print(setResult);
      setResult(1);
    `)

    expect(result).toEqual(new ObjNumber(1n));
  })
})
