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
})
