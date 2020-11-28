import { VM, InterpretResult, OpCode } from "../src";

describe('gas', () => {

  it('should consume gas', async () => {
    const gasCostOp = new Map<OpCode, number>();
    gasCostOp.set(OpCode.OpConstant, 1);
    gasCostOp.set(OpCode.OpAdd, 1);
    gasCostOp.set(OpCode.OpPop, 1);
    gasCostOp.set(OpCode.OpNull, 1);
    gasCostOp.set(OpCode.OpReturn, 1);
    
    let vm = new VM(gasCostOp);
    let compilerRes = VM.compile('1 + 1;')
    let interpretRes = await vm.interpret(compilerRes.func, 7);

    expect(interpretRes.result).toEqual(InterpretResult.InterpretRuntimeOk);
    expect(interpretRes.gasUsed).toEqual(6);
  })

  it('should run out of gas', async () => {
    const gasCostOp = new Map<OpCode, number>();
    gasCostOp.set(OpCode.OpConstant, 1);
    gasCostOp.set(OpCode.OpAdd, 1);
    gasCostOp.set(OpCode.OpPop, 1);
    gasCostOp.set(OpCode.OpNull, 1);
    gasCostOp.set(OpCode.OpReturn, 1);
    
    let vm = new VM(gasCostOp);
    let compilerRes = VM.compile('1 + 1;')
    let interpretRes = await vm.interpret(compilerRes.func, 5);

    expect(interpretRes.result).toEqual(InterpretResult.InterpretRuntimeOutOfGas);
    expect(interpretRes.gasUsed).toEqual(5);
  })
})
