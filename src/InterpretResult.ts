enum InterpretResult {
  InterpretCompileOk,
  InterpretRuntimeOk,
  InterpretCompileError,
  InterpretRuntimeError,
  InterpretRuntimeOutOfGas,
}

export default InterpretResult;
