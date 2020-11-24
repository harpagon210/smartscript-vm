import { VM, ObjNull, ObjNumber, ObjNativeFunction } from "../src";

describe('binary operations', () => {

  it('should add numbers', async () => {
    const vm = new VM();

    let result = null;
    const setResultFn = () => {
      result = vm.pop();
      return new ObjNull();
    };
    vm.setGlobal('setResult', new ObjNativeFunction(setResultFn, 'setResult'));

    await vm.interpret(`
      setResult(4 + 4);
    `)

    expect(result).toEqual(new ObjNumber(8n));
  })

  it('should subtract numbers', async () => {
    const vm = new VM();

    let result = null;
    const setResultFn = () => {
      result = vm.pop();
      return new ObjNull();
    };
    vm.setGlobal('setResult', new ObjNativeFunction(setResultFn, 'setResult'));

    await vm.interpret(`
      setResult(8 - 4);
    `)

    expect(result).toEqual(new ObjNumber(4n));
  })

  it('should multiply numbers', async () => {
    const vm = new VM();

    let result = null;
    const setResultFn = () => {
      result = vm.pop();
      return new ObjNull();
    };
    vm.setGlobal('setResult', new ObjNativeFunction(setResultFn, 'setResult'));

    await vm.interpret(`
      setResult(4 * 4);
    `)

    expect(result).toEqual(new ObjNumber(16n));
  })

  it('should divide numbers', async () => {
    const vm = new VM();

    let result = null;
    const setResultFn = () => {
      result = vm.pop();
      return new ObjNull();
    };
    vm.setGlobal('setResult', new ObjNativeFunction(setResultFn, 'setResult'));

    await vm.interpret(`
      setResult(4 / 2);
    `)

    expect(result).toEqual(new ObjNumber(2n));
  })

  it('should get the modulo', async () => {
    const vm = new VM();

    let result = null;
    const setResultFn = () => {
      result = vm.pop();
      return new ObjNull();
    };
    vm.setGlobal('setResult', new ObjNativeFunction(setResultFn, 'setResult'));

    await vm.interpret(`
      setResult(5 % 2);
    `)

    expect(result).toEqual(new ObjNumber(1n));
  })

  it('should exponential a number', async () => {
    const vm = new VM();

    let result = null;
    const setResultFn = () => {
      result = vm.pop();
      return new ObjNull();
    };
    vm.setGlobal('setResult', new ObjNativeFunction(setResultFn, 'setResult'));

    await vm.interpret(`
      setResult(3 ** 2);
    `)

    expect(result).toEqual(new ObjNumber(9n));
  })

  it('should perform a bitwise &', async () => {
    const vm = new VM();

    let result = null;
    const setResultFn = () => {
      result = vm.pop();
      return new ObjNull();
    };
    vm.setGlobal('setResult', new ObjNativeFunction(setResultFn, 'setResult'));

    await vm.interpret(`
      setResult(5 & 1);
    `)

    expect(result).toEqual(new ObjNumber(1n));
  })

  it('should perform a bitwise |', async () => {
    const vm = new VM();

    let result = null;
    const setResultFn = () => {
      result = vm.pop();
      return new ObjNull();
    };
    vm.setGlobal('setResult', new ObjNativeFunction(setResultFn, 'setResult'));

    await vm.interpret(`
      setResult(5 | 1);
    `)

    expect(result).toEqual(new ObjNumber(5n));
  })

  it('should perform a bitwise ^', async () => {
    const vm = new VM();

    let result = null;
    const setResultFn = () => {
      result = vm.pop();
      return new ObjNull();
    };
    vm.setGlobal('setResult', new ObjNativeFunction(setResultFn, 'setResult'));

    await vm.interpret(`
      setResult(5 ^ 1);
    `)

    expect(result).toEqual(new ObjNumber(4n));
  })

  it('should perform a bitwise <<', async () => {
    const vm = new VM();

    let result = null;
    const setResultFn = () => {
      result = vm.pop();
      return new ObjNull();
    };
    vm.setGlobal('setResult', new ObjNativeFunction(setResultFn, 'setResult'));

    await vm.interpret(`
      setResult(5 << 1);
    `)

    expect(result).toEqual(new ObjNumber(10n));
  })

  it('should perform a bitwise >>', async () => {
    const vm = new VM();

    let result = null;
    const setResultFn = () => {
      result = vm.pop();
      return new ObjNull();
    };
    vm.setGlobal('setResult', new ObjNativeFunction(setResultFn, 'setResult'));

    await vm.interpret(`
      setResult(5 >> 1);
    `)

    expect(result).toEqual(new ObjNumber(2n));
  })

  it('should perform a bitwise ~', async () => {
    const vm = new VM();

    let result = null;
    const setResultFn = () => {
      result = vm.pop();
      return new ObjNull();
    };
    vm.setGlobal('setResult', new ObjNativeFunction(setResultFn, 'setResult'));

    await vm.interpret(`
      setResult(~5);
    `)

    expect(result).toEqual(new ObjNumber(-6n));
  })
})
