import { VM, ObjNull, ObjNumber, ObjNativeFunction } from "../src";

describe('loop statements', () => {

  it('should handle while statement', async () => {
    const vm = new VM();

    let result = null;
    const setResultFn = () => {
      result = vm.pop();
      return new ObjNull();
    };
    vm.setGlobal('setResult', new ObjNativeFunction(setResultFn, 'setResult'));

    await vm.interpret(`
      let a = 10;
      while(a > 5) {
        a = a - 1;
      }

      setResult(a);
    `)

    expect(result).toEqual(new ObjNumber(5n));
  })

  it('should handle do while statement', async () => {
    const vm = new VM();

    let result = null;
    const setResultFn = () => {
      result = vm.pop();
      return new ObjNull();
    };
    vm.setGlobal('setResult', new ObjNativeFunction(setResultFn, 'setResult'));

    await vm.interpret(`
      let a = 10;
      do {
        a = a - 1;
      } while(a >= 5);

      setResult(a);
    `)

    expect(result).toEqual(new ObjNumber(4n));
  })

  it('should handle for statement', async () => {
    const vm = new VM();

    let result = null;
    const setResultFn = () => {
      result = vm.pop();
      return new ObjNull();
    };
    vm.setGlobal('setResult', new ObjNativeFunction(setResultFn, 'setResult'));

    await vm.interpret(`
      let i = 20;
      for (i = 0; i <= 10; i = i + 1) {
        
      }

      setResult(i);
    `)
    
    expect(result).toEqual(new ObjNumber(11n));
  })

  it('should handle break statement', async () => {
    const vm = new VM();

    let result = null;
    const setResultFn = () => {
      result = vm.pop();
      return new ObjNull();
    };
    vm.setGlobal('setResult', new ObjNativeFunction(setResultFn, 'setResult'));

    await vm.interpret(`
      let i = 20;
      for (i = 0; i <= 10; i = i + 1) {
        if (i == 5) {
          break;
        }
      }

      setResult(i);
    `)

    expect(result).toEqual(new ObjNumber(5n));
  })

  it('should handle continue statement', async () => {
    const vm = new VM();

    let result = null;
    const setResultFn = () => {
      result = vm.pop();
      return new ObjNull();
    };
    vm.setGlobal('setResult', new ObjNativeFunction(setResultFn, 'setResult'));

    await vm.interpret(`
      let j = 10;

      for (let f = 0; f <= 10; f = f + 1) {
        if (f == 5) {
          continue;
          j = 20;
        }
      }

      setResult(j);
    `)

    expect(result).toEqual(new ObjNumber(10n));
  })
})
