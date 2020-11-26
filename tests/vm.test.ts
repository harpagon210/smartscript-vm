import { VM, InterpretResult } from "../src";

describe('vm', () => {

  it('should return a runtime error', async () => {
    let vm = new VM();
    let result = await vm.interpret(`
      function test(a, b) {
        print(a + b);
      }

      test(1, 2, 3);
    `);

    expect(result.result).toEqual(InterpretResult.InterpretRuntimeError);
    expect(result.errors).toEqual(`runtime exception: Expected 2 arguments but got 3.
[line 5] in main script`);

    vm = new VM();
    result = await vm.interpret(`
      class test {
        
      }

      const a = new test();
      print(a.b);
    `);

    expect(result.result).toEqual(InterpretResult.InterpretRuntimeError);
    expect(result.errors).toEqual(`runtime exception: Undefined property 'b'.
[line 6] in main script`);

    vm = new VM();
    result = await vm.interpret(`
      class test {
        
      }

      const a = new test();
      print(a.b());
    `);

    expect(result.result).toEqual(InterpretResult.InterpretRuntimeError);
    expect(result.errors).toEqual(`runtime exception: Undefined property 'b'.
[line 6] in main script`);

    vm = new VM();
    result = await vm.interpret(`
      class test {
        
      }

      const a = new test(1);
    `);

    expect(result.result).toEqual(InterpretResult.InterpretRuntimeError);
    expect(result.errors).toEqual(`runtime exception: Expected 0 arguments but got 1.
[line 5] in main script`);

    vm = new VM();
    result = await vm.interpret(`
      const a = new Array();
      print(a.b);
    `);

    expect(result.result).toEqual(InterpretResult.InterpretRuntimeError);
    expect(result.errors).toEqual(`runtime exception: Undefined property 'b'.
[line 2] in main script`);

    vm = new VM();
    result = await vm.interpret(`
      const a = new Array();
      print(a.b());
    `);

    expect(result.result).toEqual(InterpretResult.InterpretRuntimeError);
    expect(result.errors).toEqual(`runtime exception: Undefined property 'b'.
[line 2] in main script`);

    vm = new VM();
    result = await vm.interpret(`
      const a = new Map(1);
    `);

    expect(result.result).toEqual(InterpretResult.InterpretRuntimeError);
    expect(result.errors).toEqual(`runtime exception: Expected 0 arguments but got 1.
[line 1] in main script`);

    vm = new VM();
    result = await vm.interpret(`
      const a = 1;
      a.test();
    `);

    expect(result.result).toEqual(InterpretResult.InterpretRuntimeError);
    expect(result.errors).toEqual(`runtime exception: Only instances have methods.
[line 2] in main script`);

    vm = new VM();
    result = await vm.interpret(`
      "test"();
    `);

    expect(result.result).toEqual(InterpretResult.InterpretRuntimeError);
    expect(result.errors).toEqual(`runtime exception: Can only call functions and classes.
[line 1] in main script`);

    vm = new VM();
    result = await vm.interpret(`
      print(a);
    `);

    expect(result.result).toEqual(InterpretResult.InterpretRuntimeError);
    expect(result.errors).toEqual(`runtime exception: Undefined variable a
[line 1] in main script`);

    vm = new VM();
    result = await vm.interpret(`
      a = 1;
    `);

    expect(result.result).toEqual(InterpretResult.InterpretRuntimeError);
    expect(result.errors).toEqual(`runtime exception: Undefined variable a
[line 1] in main script`);

    vm = new VM();
    result = await vm.interpret(`
      print("t".a);
    `);

    expect(result.result).toEqual(InterpretResult.InterpretRuntimeError);
    expect(result.errors).toEqual(`runtime exception: Only instances have properties.
[line 1] in main script`);

    vm = new VM();
    result = await vm.interpret(`
      "t".a = 1;
    `);

    expect(result.result).toEqual(InterpretResult.InterpretRuntimeError);
    expect(result.errors).toEqual(`runtime exception: Only instances have fields.
[line 1] in main script`);
  })

  it('should perform a benchmark', async () => {
    let vm = new VM();
    process.env.BENCHMARK = 'true';
    let compilerRes = VM.compile('1 + 1;')
    let interpretRes = await vm.interpret(compilerRes.func);

    expect(interpretRes.result).toEqual(InterpretResult.InterpretRuntimeOk);
  })

  it('should print the execution trace', async () => {
    let vm = new VM();
    process.env.TRACE_EXECUTION = 'true';
    let interpretRes = await vm.interpret(`
      1 + 1;

      if (1 == 1) {
        
      } else if (1 > 1) {

      } else if (1 < 1) { 
      
      } else {

      }

      while (false) {

      }

      do {

      } while (false);

      for(;false; 1 + 1) {

      }

      class a {
        constructor() {
          this.aprop = 1;
        }
      }

      class b extends a {
        constructor() {
          super();
          this.bprop = 2;
        }
      }
      const cl = new b();
      print(cl.aprop);
      print(cl.bprop);

      clock();
    `)

    expect(interpretRes.result).toEqual(InterpretResult.InterpretRuntimeOk);
  })
})
