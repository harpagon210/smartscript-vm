import { InterpretResult, ObjNativeFunction, ObjNull, ObjNumber, ObjString, VM } from "../src";
import ObjClosure from "../src/objects/ObjClosure";

describe('closures', () => {
  it('should change global value', async () => {
    const vm = new VM();

    let result: any;
    const setResultFn = () => {
      result = vm.pop();
      return new ObjNull();
    };
    vm.setGlobal('setResult', new ObjNativeFunction(setResultFn, 'setResult'));

    await vm.interpret(`
      let a = 1;
      {
        a = 2;
      }
      setResult(a);
    `)

    expect(result).toEqual(new ObjNumber(2n));
  })

  it('should change local value', async () => {
    const vm = new VM();

    let result: any;
    const setResultFn = () => {
      result = vm.pop();
      return new ObjNull();
    };
    vm.setGlobal('setResult', new ObjNativeFunction(setResultFn, 'setResult'));

    await vm.interpret(`
      let a = 1;
      {
        let b = 2;

        {
          b = 3;
        }
        setResult(b);
      }
    `)
      
    expect(result).toEqual(new ObjNumber(3n));
  })

  it('should return global value', async () => {
    const vm = new VM();

    let result: any;
    const setResultFn = () => {
      result = vm.pop();
      return new ObjNull();
    };
    vm.setGlobal('setResult', new ObjNativeFunction(setResultFn, 'setResult'));

    await vm.interpret(`
      let a = 3;
      let b;
      function test() {
        return a;
      }

      b = test;

      setResult(b());
    `)
      
    expect(result).toEqual(new ObjNumber(3n));
  })

  it('should return local value', async () => {
    const vm = new VM();

    let result: any;
    const setResultFn = () => {
      result = vm.pop();
      return new ObjNull();
    };
    vm.setGlobal('setResult', new ObjNativeFunction(setResultFn, 'setResult'));

    await vm.interpret(`
      let a = 3;
      let et;
      function test() {
        let c = 4;
        return c;
      }

      et = test;

      setResult(et());
    `)
      
    expect(result).toEqual(new ObjNumber(4n));
  })

  it('should handle closures', async () => {
    const vm = new VM();

    let result: Array<any> = [];
    const addResultFn = () => {
      result.push(vm.pop());
      return new ObjNull();
    };
    vm.setGlobal('addResult', new ObjNativeFunction(addResultFn, 'addResultFn'));

    await vm.interpret(`
      let globalOne;
      let globalTwo;
      
      function main() {
        {
          let a = 'one';
          function one() {
            return a;
          }
          globalOne = one;
        }
      
        {
          let a = 'two';
          function two() {
            return a;
          }
          globalTwo = two;
        }
      }
      
      main();
      addResult(globalOne());
      addResult(globalTwo());

      print(globalOne);

      {
        let a = 3;
        function fn() {
          print(a);
          addResult(a);
        }
      }

      
      {
        let m;
        {
          let n = 5;
          function fn() {
            print(n);
            addResult(m);
          }
          m = fn;
        }
        m();
      }
    `)
    expect(result[0]).toEqual(new ObjString('one'));
    expect(result[1]).toEqual(new ObjString('two'));
  })

  it('should print main closure and function name', async () => {
    const { func } = VM.compile('function test () {}');
    const closure = new ObjClosure(func);
    expect(func.chunk.constants[1].asString()).toEqual('<function test>');
    expect(closure.asString()).toEqual('<closure main script>');
  })

  it('should error out when compiling', async () => {
    let vm = new VM();

    let result = await vm.interpret(`
      let a = 3;
      
      {
        let b = b;
      }
    `)
    
    expect(result.result).toEqual(InterpretResult.InterpretCompileError);
    expect(result.errors).toEqual('[line 4] Error at b: Cannot read local variable in its own initializer.');
  })
})
