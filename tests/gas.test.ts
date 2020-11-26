import { VM, InterpretResult } from "../src";

describe('gas', () => {

  it('should consume gas', async () => {
    let vm = new VM();
    let compilerRes = VM.compile('1 + 1;')
    let interpretRes = await vm.interpret(compilerRes.func, 7);

    expect(interpretRes.result).toEqual(InterpretResult.InterpretRuntimeOk);
    expect(interpretRes.gasUsed).toEqual(6);
  })

  it('should run out of gas', async () => {
    let vm = new VM();
    let compilerRes = VM.compile('1 + 1;')
    let interpretRes = await vm.interpret(compilerRes.func, 5);

    expect(interpretRes.result).toEqual(InterpretResult.InterpretRuntimeOutOfGas);
    expect(interpretRes.gasUsed).toEqual(5);
  })
})
