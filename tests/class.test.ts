import { VM, ObjNull, ObjNativeFunction, ObjInstance, ObjString, ObjNumber, InterpretResult } from "../src";
import ObjClosure from "../src/objects/ObjClosure";

describe('class', () => {

  it('should generate an instance of a class', async () => {
    const vm = new VM();

    let result: any;
    const setResultFn = () => {
      result = vm.pop();
      return new ObjNull();
    };
    vm.setGlobal('setResult', new ObjNativeFunction(setResultFn, 'setResult'));

    await vm.interpret(`
      class ClassA {

      }

      let instance = new ClassA();

      print(ClassA);
      print(instance);
      setResult(instance);
    `)

    expect(result instanceof ObjInstance).toBeTruthy();
    if (result instanceof ObjInstance) {
      expect(result.klass.name).toEqual('ClassA');
    }
  })

  it('should call the constructor of a class', async () => {
    const vm = new VM();

    let result: any;
    const setResultFn = () => {
      result = vm.pop();
      return new ObjNull();
    };
    vm.setGlobal('setResult', new ObjNativeFunction(setResultFn, 'setResult'));

    await vm.interpret(`
      class ClassA {
        constructor() {
          setResult('constructor called');
        }
      }

      let instance = new ClassA();
    `)

    expect(result).toEqual(new ObjString('constructor called'));
  })

  it('should set properties on an instance', async () => {
    const vm = new VM();

    let result: any;
    const setResultFn = () => {
      result = vm.pop();
      return new ObjNull();
    };
    vm.setGlobal('setResult', new ObjNativeFunction(setResultFn, 'setResult'));

    await vm.interpret(`
      class ClassA {
        constructor() {
          this.a = 4;
        }
      }

      let instance = new ClassA();

      setResult(instance);
    `)

    expect(result instanceof ObjInstance).toBeTruthy();
    if (result instanceof ObjInstance) {
      expect(result.getField('a')).toEqual(new ObjNumber(4n));
    }
  })

  it('should set methods on an instance', async () => {
    const vm = new VM();

    let result: any;
    const setResultFn = () => {
      result = vm.pop();
      return new ObjNull();
    };
    vm.setGlobal('setResult', new ObjNativeFunction(setResultFn, 'setResult'));

    await vm.interpret(`
      class ClassA {
        MethodA() {
          return null;
        }
      }

      let instance = new ClassA();

      setResult(instance);
    `)

    expect(result instanceof ObjInstance).toBeTruthy();
    if (result instanceof ObjInstance) {
      expect(result.klass.getMethod('MethodA') instanceof ObjClosure).toBeTruthy();
    }
  })

  it('should call method on an instance', async () => {
    const vm = new VM();

    let result: any;
    const setResultFn = () => {
      result = vm.pop();
      return new ObjNull();
    };
    vm.setGlobal('setResult', new ObjNativeFunction(setResultFn, 'setResult'));

    await vm.interpret(`
      class ClassA {
        MethodA() {
          return 'a';
        }
      }

      let instance = new ClassA();
      print(instance.MethodA);
      setResult(instance.MethodA());
    `)

    expect(result).toEqual(new ObjString('a'));
  })

  it('should inherit', async () => {
    const vm = new VM();

    let results: Array<any> = [];
    const addResultFn = () => {
      results.push(vm.pop());
      return new ObjNull();
    };
    vm.setGlobal('addResult', new ObjNativeFunction(addResultFn, 'addResult'));

    await vm.interpret(`
      class Doughnut {
        constructor() {
          this.dough = "yeast";
        }
        cook() {
          return this.finish("sprinkles");
        }
      
        finish(ingredient) {
          return "Finish with " + ingredient;
        }
      }

      class Cruller extends Doughnut {
        constructor() {
          super();
        }

        finish() {
          // No sprinkles, always icing.
          return super.finish('icing');
        }

        getDough() {
          return super.dough;
        }
      }

      const e = new Doughnut();
      addResult(e.finish('chocolate'));

      const t = new Cruller();
      addResult(t.finish());
    `)

    expect(results[0]).toEqual(new ObjString('Finish with chocolate'));
    expect(results[1]).toEqual(new ObjString('Finish with icing'));
  })

  it('should error out when compiling', async () => {
    let vm = new VM();

    let result = await vm.interpret(`
      class Doughnut {
        constructor() {
          this.dough = "yeast";
        }
      }

      class Cruller extends Doughnut {
        test() {
          super();
        }
      }
    `)
    
    expect(result.result).toEqual(InterpretResult.InterpretCompileError);
    expect(result.errors).toEqual('[line 9] Error at super: Super calls are not permitted outside constructors or in nested functions inside constructors.');

    vm = new VM();

    result = await vm.interpret(`
      super();
    `)
    
    expect(result.result).toEqual(InterpretResult.InterpretCompileError);
    expect(result.errors).toEqual("[line 1] Error at super: Cannot use 'super' outside of a class.");

    vm = new VM();

    result = await vm.interpret(`
      this.a;
    `)
    
    expect(result.result).toEqual(InterpretResult.InterpretCompileError);
    expect(result.errors).toEqual("[line 1] Error at this: Cannot use 'this' outside of a class.");

    vm = new VM();

    result = await vm.interpret(`
    class Cruller {
      test() {
        super();
      }
    }
    `)
    
    expect(result.result).toEqual(InterpretResult.InterpretCompileError);
    expect(result.errors).toEqual("[line 3] Error at super: Cannot use 'super' in a class with no superclass.");

    vm = new VM();

    let args = 'a1';
    for (let index = 2; index < 257; index++) {
      args = `${args},a${index}`;
    }

    result = await vm.interpret(`
      class Cruller {
        test(${args}) {
          
        }
      }
    `)
    
    expect(result.result).toEqual(InterpretResult.InterpretCompileError);
    expect(result.errors).toEqual("[line 2] Error at a256: Cannot have more than 255 parameters.");

    vm = new VM();

    result = await vm.interpret(`
      class Cruller {
        constructor() {
            return 1;
        }
      }
    `)
    
    expect(result.result).toEqual(InterpretResult.InterpretCompileError);
    expect(result.errors).toEqual("[line 3] Error at return: Cannot return a value from an initializer.");

    vm = new VM();

    result = await vm.interpret(`
      class Cruller extends Cruller {
        constructor() {
            return 1;
        }
      }
    `)
    
    expect(result.result).toEqual(InterpretResult.InterpretCompileError);
    expect(result.errors).toEqual("[line 1] Error at Cruller: A class cannot inherit from itself.");
  })
})
