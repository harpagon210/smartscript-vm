import { VM, ObjNull, ObjNumber, ObjNativeFunction, ObjBool, InterpretResult } from "../src";

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

  it('should only add numbers and strings', async () => {
    const vm = new VM();
    const result = await vm.interpret('true + false;')

    expect(result.result).toEqual(InterpretResult.InterpretRuntimeError);
    expect(result.errors).toEqual(`runtime exception: Operands must be two numbers or two strings.
[line 1] in main script`);
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

  it('should be greather than', async () => {
    const vm = new VM();

    let result = null;
    const setResultFn = () => {
      result = vm.pop();
      return new ObjNull();
    };
    vm.setGlobal('setResult', new ObjNativeFunction(setResultFn, 'setResult'));

    await vm.interpret(`
      setResult(5 > 1);
    `)

    expect(result).toEqual(new ObjBool(true));
  })

  it('should be lower than', async () => {
    const vm = new VM();

    let result = null;
    const setResultFn = () => {
      result = vm.pop();
      return new ObjNull();
    };
    vm.setGlobal('setResult', new ObjNativeFunction(setResultFn, 'setResult'));

    await vm.interpret(`
      setResult(1 < 5);
    `)

    expect(result).toEqual(new ObjBool(true));
  })

  it('should be greater than or equal', async () => {
    const vm = new VM();

    let result = null;
    const setResultFn = () => {
      result = vm.pop();
      return new ObjNull();
    };
    vm.setGlobal('setResult', new ObjNativeFunction(setResultFn, 'setResult'));

    await vm.interpret(`
      setResult(5 >= 1);
    `)

    expect(result).toEqual(new ObjBool(true));

    const vm2 = new VM();

    let result2 = null;
    const setResultFn2 = () => {
      result2 = vm2.pop();
      return new ObjNull();
    };
    vm2.setGlobal('setResult', new ObjNativeFunction(setResultFn2, 'setResult'));

    await vm2.interpret(`
      setResult(5 >= 5);
    `)

    expect(result2).toEqual(new ObjBool(true));
  })

  it('should be lower than or equal', async () => {
    const vm = new VM();

    let result = null;
    const setResultFn = () => {
      result = vm.pop();
      return new ObjNull();
    };
    vm.setGlobal('setResult', new ObjNativeFunction(setResultFn, 'setResult'));

    await vm.interpret(`
      setResult(1 <= 5);
    `)

    expect(result).toEqual(new ObjBool(true));

    const vm2 = new VM();

    let result2 = null;
    const setResultFn2 = () => {
      result2 = vm2.pop();
      return new ObjNull();
    };
    vm2.setGlobal('setResult', new ObjNativeFunction(setResultFn2, 'setResult'));

    await vm2.interpret(`
      setResult(5 <= 5);
    `)

    expect(result2).toEqual(new ObjBool(true));
  })

  it('should be equal', async () => {
    const vm = new VM();

    let result = null;
    const setResultFn = () => {
      result = vm.pop();
      return new ObjNull();
    };
    vm.setGlobal('setResult', new ObjNativeFunction(setResultFn, 'setResult'));

    await vm.interpret(`
      setResult(5 == 5);
    `)

    expect(result).toEqual(new ObjBool(true));
  })

  it('should be different', async () => {
    const vm = new VM();

    let result = null;
    const setResultFn = () => {
      result = vm.pop();
      return new ObjNull();
    };
    vm.setGlobal('setResult', new ObjNativeFunction(setResultFn, 'setResult'));

    await vm.interpret(`
      setResult(5 != 1);
    `)

    expect(result).toEqual(new ObjBool(true));
  })
})
