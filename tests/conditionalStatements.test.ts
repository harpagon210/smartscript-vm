import { VM, ObjNull, ObjNumber, ObjNativeFunction } from "../src";

describe('consitional statements', () => {

  it('should handle if statement', async () => {
    const vm = new VM();

    let result = null;
    const setResultFn = () => {
      result = vm.pop();
      return new ObjNull();
    };
    vm.setGlobal('setResult', new ObjNativeFunction(setResultFn, 'setResult'));

    await vm.interpret(`
      const ni = 4;
      if (ni == 4) {
        setResult(ni);
      }
    `)

    expect(result).toEqual(new ObjNumber(4n));
  })

  it('should handle else statement', async () => {
    const vm = new VM();

    let result = null;
    const setResultFn = () => {
      result = vm.pop();
      return new ObjNull();
    };
    vm.setGlobal('setResult', new ObjNativeFunction(setResultFn, 'setResult'));

    await vm.interpret(`
      const n = 5;
      if (n == 4) {
        setResult(n);
      } else {
        setResult(n);
      }
    `)

    expect(result).toEqual(new ObjNumber(5n));
  })

  it('should handle else if statement', async () => {
    const vm = new VM();

    let result = null;
    const setResultFn = () => {
      result = vm.pop();
      return new ObjNull();
    };
    vm.setGlobal('setResult', new ObjNativeFunction(setResultFn, 'setResult'));

    await vm.interpret(`
      const a = 5;
      if (a == 4) {
        setResult(a);
      } else if (a == 5) {
        setResult(a);
      } else {
        setResult(0);
      }
    `)

    expect(result).toEqual(new ObjNumber(5n));
  })

  it('should handle &&', async () => {
    const vm = new VM();

    let result = null;
    const setResultFn = () => {
      result = vm.pop();
      return new ObjNull();
    };
    vm.setGlobal('setResult', new ObjNativeFunction(setResultFn, 'setResult'));

    await vm.interpret(`
      const a = 4;
      const b = 4;
      if (a == 4 && b == 4) {
        setResult(a);
      }
    `)

    expect(result).toEqual(new ObjNumber(4n));
  })

  it('should handle ||', async () => {
    const vm = new VM();

    let result = null;
    const setResultFn = () => {
      result = vm.pop();
      return new ObjNull();
    };
    vm.setGlobal('setResult', new ObjNativeFunction(setResultFn, 'setResult'));

    await vm.interpret(`
      const a = 4;
      const b = 5;
      if (a == 4 || b == 5) {
        setResult(b);
      }
    `)

    expect(result).toEqual(new ObjNumber(5n));
  })

  it('should handle !=', async () => {
    const vm = new VM();

    let result = null;
    const setResultFn = () => {
      result = vm.pop();
      return new ObjNull();
    };
    vm.setGlobal('setResult', new ObjNativeFunction(setResultFn, 'setResult'));

    await vm.interpret(`
      const a = 4;
      const b = 5;
      if (a != b) {
        setResult(b);
      }
    `)

    expect(result).toEqual(new ObjNumber(5n));
  })
})
