import { VM, InterpretResult, ObjNull, ObjNativeFunction, ObjString } from "../src";

describe('compiler', () => {

  it('should return a compilation error', async () => {
    let result = VM.compile('const conv = 1');

    expect(result.result).toEqual(InterpretResult.InterpretCompileError);
    expect(result.errors).toEqual("[line 1] Error at end: Expect ';' after variable declaration.");

    result = VM.compile('const ct = "dsfsdf');
    expect(result.result).toEqual(InterpretResult.InterpretCompileError);
    expect(result.errors).toEqual("[line 1] Error: Unterminated string.");

    result = VM.compile('\\');

    expect(result.result).toEqual(InterpretResult.InterpretCompileError);
    expect(result.errors).toEqual("[line 1] Error: Unexpected character.");

    result = VM.compile('const a = 1 >');

    expect(result.result).toEqual(InterpretResult.InterpretCompileError);
    expect(result.errors).toEqual("[line 1] Error at end: Expect expression.");

    result = VM.compile('1 = a');

    expect(result.result).toEqual(InterpretResult.InterpretCompileError);
    expect(result.errors).toEqual("[line 1] Error at =: Invalid assignment target.");

    result = VM.compile(`const a = 1;
    a = 2;`);

    expect(result.result).toEqual(InterpretResult.InterpretCompileError);
    expect(result.errors).toEqual("[line 2] Error at =: Cannot reassign const a");

    let args = 'a1';
    for (let index = 2; index < 257; index++) {
      args = `${args},a${index}`;
    }
    result = VM.compile(`
      function test() {
          
      }

      test(${args})
    `)

    expect(result.result).toEqual(InterpretResult.InterpretCompileError);
    expect(result.errors).toEqual("[line 5] Error at a256: Cannot have more than 255 arguments.");

    result = VM.compile(`return 1;`);

    expect(result.result).toEqual(InterpretResult.InterpretCompileError);
    expect(result.errors).toEqual("[line 1] Error at return: Cannot return from top-level code.");

    result = VM.compile(`
    {
      let a = 3;
      let a = 4;
    }`);

    expect(result.result).toEqual(InterpretResult.InterpretCompileError);
    expect(result.errors).toEqual("[line 3] Error at a: Variable with this name already declared in this scope.");

    result = VM.compile(`
      let a = 3
      let b = 4;
    `);

    expect(result.result).toEqual(InterpretResult.InterpretCompileError);
    expect(result.errors).toEqual("[line 2] Error at let: Expect ';' after variable declaration.");

    result = VM.compile(`
      let a = 3
      class b {

      }
    `);

    expect(result.result).toEqual(InterpretResult.InterpretCompileError);
    expect(result.errors).toEqual("[line 2] Error at class: Expect ';' after variable declaration.");
  })

  it('should compile comments', async () => {
    const vm = new VM();

    let result: any;
    const setResultFn = () => {
      result = vm.pop();
      return new ObjNull();
    };
    vm.setGlobal('setResult', new ObjNativeFunction(setResultFn, 'setResult'));

    const interpretRes = await vm.interpret(`
      // this is an inline comment
      /* this 
        is 
        a 
        block
        comment
      */ 
     setResult("test");
      /*
      another one`)

    expect(interpretRes.result).toEqual(InterpretResult.InterpretRuntimeOk);
    expect(result).toEqual(new ObjString('test'));
  })

  it('should print code and not print code', async () => {
    let vm = new VM();
    process.env.DEBUG_PRINT_CODE = 'true';
    let interpretRes = await vm.interpret(`
    1 + 1;
    1 - 1;
    1 * 1;
    1 / 1;
    1 % 1;
    1 & 1;
    1 | 1;
    1 ^ 1;
    1 << 1;
    1 >> 1;
    -1;
    !true;

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

      testSuper() {

      }
    }

    class b extends a {
      constructor() {
        super();
        this.bprop = 2;
      }

      test() {
        super.testSuper();
      }
    }
    const cl = new b();
    print(cl.aprop);
    print(cl.bprop);
    print(cl.test());

    let t = [1,2];
    t[0] = t[1];
    let t2 = { a: 1, b: 2 };
    t2['a'] = t2['b'];
  `)
    expect(interpretRes.result).toEqual(InterpretResult.InterpretRuntimeOk);

    vm = new VM();
    interpretRes = await vm.interpret('1 + 1')
    expect(interpretRes.result).toEqual(InterpretResult.InterpretCompileError);
  })
})
