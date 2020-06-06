import { printObj } from './values';
import OpCode from './OpCode';
import Chunk from './Chunk';
import ObjFunction from './objects/ObjFunction';

const printHelper = (name: string, chunk: Chunk, offset: number): string => {
  let output = `${offset}`.padStart(4, '0');
  if (offset > 0 && chunk.lines[offset] === chunk.lines[offset - 1]) {
    output = `${output}  |   `;
  } else {
    output = `${output}  ${chunk.lines[offset]}`;
  }

  return `${output}  ${name}   `;
};

const constantInstruction = (name: string, chunk: Chunk, offset: number): number => {
  const constant = chunk.code[offset + 1];
  const value = chunk.constants[constant];
  // eslint-disable-next-line no-console
  console.log(`${printHelper(name, chunk, offset)} index ${constant} value ${printObj(value)}`);
  return offset + 2;
};

const byteInstruction = (name: string, chunk: Chunk, offset: number): number => {
  const slot = chunk.code[offset + 1];
  // eslint-disable-next-line no-console
  console.log(`${printHelper(name, chunk, offset)} ${slot}`);
  return offset + 2;
};

const jumpInstruction = (name: string, sign: number, chunk: Chunk, offset: number): number => {
  const jump = chunk.code[offset + 1];
  if (typeof jump !== 'number') {
    throw new Error('number must be a number');
  }
  // eslint-disable-next-line no-console
  console.log(`${printHelper(name, chunk, offset)} -> ${offset + 2 * jump * sign}`);
  return offset + 2;
};

const simpleInstruction = (name: string, chunk: Chunk, offset: number): number => {
  // eslint-disable-next-line no-console
  console.log(`${printHelper(name, chunk, offset)}`);
  return offset + 1;
};

const invokeInstruction = (name: string, chunk: Chunk, offset: number): number => {
  const constant = chunk.code[offset + 1];
  const argCount = chunk.code[offset + 2];

  // eslint-disable-next-line no-console
  console.log(`${printHelper(name, chunk, offset)} ${argCount} ${constant} ${printObj(chunk.constants[constant])}`);
  return offset + 3;
};

const disassembleInstruction = (chunk: Chunk, offset: number): number => {
  const instruction = chunk.code[offset];
  switch (instruction) {
    case OpCode.OpConstant:
      return constantInstruction('OP_CONSTANT', chunk, offset);
    case OpCode.OpNull:
      return simpleInstruction('OP_NIL', chunk, offset);
    case OpCode.OpTrue:
      return simpleInstruction('OP_TRUE', chunk, offset);
    case OpCode.OpFalse:
      return simpleInstruction('OP_FALSE', chunk, offset);
    case OpCode.OpPop:
      return simpleInstruction('OP_POP', chunk, offset);
    case OpCode.OpGetLocal:
      return byteInstruction('OP_GET_LOCAL', chunk, offset);
    case OpCode.OpSetLocal:
      return byteInstruction('OP_SET_LOCAL', chunk, offset);
    case OpCode.OpGetGlobal:
      return constantInstruction('OP_GET_GLOBAL', chunk, offset);
    case OpCode.OpGetUpvalue:
      return byteInstruction('OP_GET_UPVALUE', chunk, offset);
    case OpCode.OpSetUpvalue:
      return byteInstruction('OP_SET_UPVALUE', chunk, offset);
    case OpCode.OpGetProperty:
      return constantInstruction('OP_GET_PROPERTY', chunk, offset);
    case OpCode.OpSetProperty:
      return constantInstruction('OP_SET_PROPERTY', chunk, offset);
    case OpCode.OpDefineGlobal:
      return constantInstruction('OP_DEFINE_GLOBAL', chunk, offset);
    case OpCode.OpSetGlobal:
      return constantInstruction('OP_SET_GLOBAL', chunk, offset);
    case OpCode.OpGetSuper:
      return constantInstruction('OP_GET_SUPER', chunk, offset);
    case OpCode.OpEqual:
      return simpleInstruction('OP_EQUAL', chunk, offset);
    case OpCode.OpGreater:
      return simpleInstruction('OP_GREATER', chunk, offset);
    case OpCode.OpLess:
      return simpleInstruction('OP_LESS', chunk, offset);
    case OpCode.OpAdd:
      return simpleInstruction('OP_ADD', chunk, offset);
    case OpCode.OpSubtract:
      return simpleInstruction('OP_SUBTRACT', chunk, offset);
    case OpCode.OpMultiply:
      return simpleInstruction('OP_MULTIPLY', chunk, offset);
    case OpCode.OpDivide:
      return simpleInstruction('OP_DIVIDE', chunk, offset);
    case OpCode.OpNot:
      return simpleInstruction('OP_NOT', chunk, offset);
    case OpCode.OpNegate:
      return simpleInstruction('OP_NEGATE', chunk, offset);
    case OpCode.OpPrint:
      return simpleInstruction('OP_PRINT', chunk, offset);
    case OpCode.OpJump:
      return jumpInstruction('OP_JUMP', 1, chunk, offset);
    case OpCode.OpJumpIfFalse:
      return jumpInstruction('OP_JUMP_IF_FALSE', 1, chunk, offset);
    case OpCode.OpLoop:
      return jumpInstruction('OP_LOOP', -1, chunk, offset);
    case OpCode.OpCall:
      return byteInstruction('OP_CALL', chunk, offset);
    case OpCode.OpClosure: {
      let off = offset + 1;
      const constant = chunk.code[off];
      off += 1;
      // eslint-disable-next-line no-console
      console.log(`${printHelper('OP_CLOSURE', chunk, offset)} ${constant} ${printObj(chunk.constants[constant])}`);

      const func = chunk.constants[constant];

      if (func instanceof ObjFunction) {
        for (let j = 0; j < func.upvalues.length; j += 1) {
          const isLocal = chunk.code[off];
          off += 1;
          const index = chunk.code[off];
          off += 1;
          const offString = `${off - 2}`.padStart(4, '0');
          // eslint-disable-next-line no-console
          console.log(`${offString}  |       ${isLocal === 1 ? 'local' : 'upvalue'}  ${index}`);
        }
      }

      return off;
    }
    case OpCode.OpCloseUpvalue:
      return simpleInstruction('OP_CLOSE_UPVALUE', chunk, offset);
    case OpCode.OpReturn:
      return simpleInstruction('OP_RETURN', chunk, offset);
    case OpCode.OpClass:
      return constantInstruction('OP_CLASS', chunk, offset);
    case OpCode.OpInherit:
      return simpleInstruction('OP_INHERIT', chunk, offset);
    case OpCode.OpMethod:
      return constantInstruction('OP_METHOD', chunk, offset);
    case OpCode.OpInvoke:
      return invokeInstruction('OP_INVOKE', chunk, offset);
    case OpCode.OpSuperInvoke:
      return invokeInstruction('OP_SUPER_INVOKE', chunk, offset);
    default:
      // eslint-disable-next-line no-console
      console.log(`Unknown OpCode ${instruction}`);
      return offset + 1;
  }
};

const disassembleChunk = (chunk: Chunk, name: string) => {
  // eslint-disable-next-line no-console
  console.log(`== ${name} ==`);
  for (let offset = 0; offset < chunk.code.length;) {
    offset = disassembleInstruction(chunk, offset);
  }
};

export { disassembleChunk, disassembleInstruction };
