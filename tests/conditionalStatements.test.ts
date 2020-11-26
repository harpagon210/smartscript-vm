import { VM, ObjNull, ObjNumber, ObjNativeFunction, ObjBool } from "../src";

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

  it('should handle equalities', async () => {
    const vm = new VM();

    let results: Array<any> = [];
    const addResultFn = () => {
      results.push(vm.pop());
      return new ObjNull();
    };
    vm.setGlobal('addResult', new ObjNativeFunction(addResultFn, 'addResult'));

    await vm.interpret(`
      addResult(true == true);
      addResult(false == false);
      addResult(1 == 1);
      addResult("1" == "1");
      addResult(null == null);
    `)

    expect(results[0]).toEqual(new ObjBool(true));
    expect(results[1]).toEqual(new ObjBool(true));
    expect(results[2]).toEqual(new ObjBool(true));
    expect(results[3]).toEqual(new ObjBool(true));
    expect(results[4]).toEqual(new ObjBool(true));
  })
})
