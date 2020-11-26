import { VM, InterpretResult } from "../src";

describe('vm', () => {

  it('should return a runtime error', async () => {
    let result = VM.compile('const conv = 1');

    expect(result.result).toEqual(InterpretResult.InterpretCompileError);
    expect(result.errors).toEqual("[line 1] Error at end: Expect ';' after variable declaration.");
  })

  it('should perform a benchmark', async () => {
    let vm = new VM();
    process.env.BENCHMARK = 'true';
    let interpretRes = await vm.interpret('1 + 1;')

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
    `)

    expect(interpretRes.result).toEqual(InterpretResult.InterpretRuntimeOk);
  })
})
