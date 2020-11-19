import Scanner from './Scanner';
import Parser from './Parser';
import { disassembleChunk } from './debug';
import Precedence from './Precedence';
import Rule from './Rule';
import Local from './Local';
import ClassCompiler from './ClassCompiler';
import { FunctionType } from './values';
import ObjFunction from './objects/ObjFunction';
import { TokenType, Token } from './Token';
import Chunk from './Chunk';
import OpCode from './OpCode';
import Obj from './objects/Obj';
import UpValue from './UpValue';
import ObjNumber from './objects/ObjNumber';
import ObjString from './objects/ObjString';

class Compiler {
  source: string;

  type: FunctionType;

  scanner: Scanner;

  enclosing?: Compiler;

  parser: Parser;

  locals: Array<Local>;

  scopeDepth: number;

  func: ObjFunction;

  currentClass: ClassCompiler;

  compilingConst: boolean;

  globalConsts: Array<string>;

  rules: Map<TokenType, Rule>;

  constructor(type: FunctionType, scanner: Scanner, enclosing?: Compiler) {
    this.source = null;
    this.scanner = scanner;
    this.parser = enclosing ? enclosing.parser : new Parser();
    this.enclosing = enclosing || null;
    this.locals = [];
    this.scopeDepth = 0;
    this.func = new ObjFunction();
    this.type = type;
    this.currentClass = enclosing ? enclosing.currentClass : null;
    this.compilingConst = false;
    this.globalConsts = [];

    this.rules = new Map<TokenType, Rule>();
    this.rules.set(TokenType.TokenLeftParen, new Rule('grouping', 'call', Precedence.PrecCall));
    this.rules.set(TokenType.TokenRightParen, new Rule(null, null, Precedence.PrecNone));
    this.rules.set(TokenType.TokenLeftBrace, new Rule('map', null, Precedence.PrecNone));
    this.rules.set(TokenType.TokenRightBrace, new Rule(null, null, Precedence.PrecNone));
    this.rules.set(TokenType.TokenLeftBracket, new Rule('array', 'arraySetGet', Precedence.PrecCall));
    this.rules.set(TokenType.TokenRightBracket, new Rule(null, null, Precedence.PrecNone));
    this.rules.set(TokenType.TokenComma, new Rule(null, null, Precedence.PrecNone));
    this.rules.set(TokenType.TokenDot, new Rule(null, 'dot', Precedence.PrecCall));
    this.rules.set(TokenType.TokenMinus, new Rule('unary', 'binary', Precedence.PrecTerm));
    this.rules.set(TokenType.TokenPlus, new Rule(null, 'binary', Precedence.PrecTerm));
    this.rules.set(TokenType.TokenModulo, new Rule(null, 'binary', Precedence.PrecTerm));
    this.rules.set(TokenType.TokenExponent, new Rule(null, 'binary', Precedence.PrecTerm));
    this.rules.set(TokenType.TokenBitwiseAnd, new Rule(null, 'binary', Precedence.PrecTerm));
    this.rules.set(TokenType.TokenBitwiseOr, new Rule(null, 'binary', Precedence.PrecTerm));
    this.rules.set(TokenType.TokenBitwiseXor, new Rule(null, 'binary', Precedence.PrecTerm));
    this.rules.set(TokenType.TokenBitwiseNot, new Rule('unary', null, Precedence.PrecNone));
    this.rules.set(TokenType.TokenBitwiseShiftLeft, new Rule(null, 'binary', Precedence.PrecTerm));
    this.rules.set(TokenType.TokenBitwiseShiftRight, new Rule(null, 'binary', Precedence.PrecTerm));
    this.rules.set(TokenType.TokenSemicolon, new Rule(null, null, Precedence.PrecNone));
    this.rules.set(TokenType.TokenColon, new Rule(null, null, Precedence.PrecNone));
    this.rules.set(TokenType.TokenSlash, new Rule(null, 'binary', Precedence.PrecFactor));
    this.rules.set(TokenType.TokenStar, new Rule(null, 'binary', Precedence.PrecFactor));
    this.rules.set(TokenType.TokenBang, new Rule('unary', null, Precedence.PrecNone));
    this.rules.set(TokenType.TokenBangEqual, new Rule(null, 'binary', Precedence.PrecEquality));
    this.rules.set(TokenType.TokenEqual, new Rule(null, null, Precedence.PrecNone));
    this.rules.set(TokenType.TokenEqualEqual, new Rule(null, 'binary', Precedence.PrecEquality));
    this.rules.set(TokenType.TokenGreater, new Rule(null, 'binary', Precedence.PrecComparison));
    this.rules.set(TokenType.TokenGreaterEqual, new Rule(null, 'binary', Precedence.PrecComparison));
    this.rules.set(TokenType.TokenLess, new Rule(null, 'binary', Precedence.PrecComparison));
    this.rules.set(TokenType.TokenLessEqual, new Rule(null, 'binary', Precedence.PrecComparison));
    this.rules.set(TokenType.TokenIdentifier, new Rule('variable', null, Precedence.PrecNone));
    this.rules.set(TokenType.TokenString, new Rule('string', null, Precedence.PrecNone));
    this.rules.set(TokenType.TokenNumber, new Rule('number', null, Precedence.PrecNone));
    this.rules.set(TokenType.TokenAnd, new Rule(null, 'and', Precedence.PrecAnd));
    this.rules.set(TokenType.TokenClass, new Rule(null, null, Precedence.PrecNone));
    this.rules.set(TokenType.TokenNew, new Rule(null, null, Precedence.PrecNone));
    this.rules.set(TokenType.TokenElse, new Rule(null, null, Precedence.PrecNone));
    this.rules.set(TokenType.TokenFalse, new Rule('literal', null, Precedence.PrecNone));
    this.rules.set(TokenType.TokenFor, new Rule(null, null, Precedence.PrecNone));
    this.rules.set(TokenType.TokenFunction, new Rule(null, null, Precedence.PrecNone));
    this.rules.set(TokenType.TokenIf, new Rule(null, null, Precedence.PrecNone));
    this.rules.set(TokenType.TokenNull, new Rule('literal', null, Precedence.PrecNone));
    this.rules.set(TokenType.TokenOr, new Rule(null, 'or', Precedence.PrecOr));
    this.rules.set(TokenType.TokenPrint, new Rule(null, null, Precedence.PrecNone));
    this.rules.set(TokenType.TokenReturn, new Rule(null, null, Precedence.PrecNone));
    this.rules.set(TokenType.TokenSuper, new Rule('superr', null, Precedence.PrecNone));
    this.rules.set(TokenType.TokenThis, new Rule('thiss', null, Precedence.PrecNone));
    this.rules.set(TokenType.TokenTrue, new Rule('literal', null, Precedence.PrecNone));
    this.rules.set(TokenType.TokenLet, new Rule(null, null, Precedence.PrecNone));
    this.rules.set(TokenType.TokenConst, new Rule(null, null, Precedence.PrecNone));
    this.rules.set(TokenType.TokenDo, new Rule(null, null, Precedence.PrecNone));
    this.rules.set(TokenType.TokenWhile, new Rule(null, null, Precedence.PrecNone));
    this.rules.set(TokenType.TokenError, new Rule(null, null, Precedence.PrecNone));
    this.rules.set(TokenType.TokenEof, new Rule(null, null, Precedence.PrecNone));
    this.rules.set(TokenType.TokenExt, new Rule(null, null, Precedence.PrecNone));

    if (type !== FunctionType.TypeFunction) {
      this.locals.push(new Local('this', 0, false, false));
    } else {
      this.locals.push(new Local('', 0, false, false));
    }

    if (type !== FunctionType.TypeScript) {
      this.func.name = this.parser.previous.lexeme;
    }
  }

  errorAt(token: Token, message: string): void {
    if (this.parser.panicMode) return;
    this.parser.panicMode = true;
    let output = `[line ${token.line}] Error`;

    if (token.type === TokenType.TokenEof) {
      output = `${output} at end`;
    } else if (token.type === TokenType.TokenError) {
      // Nothing.
    } else {
      output = `${output} at ${token.lexeme}`;
    }

    // eslint-disable-next-line no-console
    console.error(`${output}: ${message}`);
    this.parser.hadError = true;
  }

  error(message: string): void {
    this.errorAt(this.parser.previous, message);
  }

  errorAtCurrent(message: string): void {
    this.errorAt(this.parser.current, message);
  }

  advance(): void {
    this.parser.previous = this.parser.current;

    for (; ;) {
      this.parser.current = this.scanner.scanToken();
      // console.log('advance', this.parser.current);
      if (this.parser.current.type !== TokenType.TokenError) break;

      this.errorAtCurrent(this.parser.current.lexeme);
    }
  }

  consume(type: TokenType, message: string): void {
    if (this.parser.current.type === type) {
      this.advance();
      return;
    }

    this.errorAtCurrent(message);
  }

  currentChunk(): Chunk {
    return this.func.chunk;
  }

  emitByte(byte: OpCode | number): void {
    this.currentChunk().write(byte, this.parser.previous.line);
  }

  emitBytes(byte1: OpCode | number, byte2: OpCode | number): void {
    this.emitByte(byte1);
    this.emitByte(byte2);
  }

  emitReturn(): void {
    if (this.type === FunctionType.TypeInitializer) {
      this.emitBytes(OpCode.OpGetLocal, 0);
    } else {
      this.emitByte(OpCode.OpNull);
    }
    this.emitByte(OpCode.OpReturn);
  }

  endCompiler(): ObjFunction {
    this.emitReturn();

    const { func } = this;

    if (process.env.DEBUG_PRINT_CODE === 'true') {
      if (!this.parser.hadError) {
        disassembleChunk(this.currentChunk(), func.name || '<script>');
      }
    }

    return func;
  }

  makeConstant(obj: Obj): number {
    const constant = this.currentChunk().addConstant(obj);

    if (constant > Number.MAX_SAFE_INTEGER) {
      this.error('Too many constants in one chunk.');
      return 0;
    }

    return constant;
  }

  emitConstant(obj: Obj): void {
    this.emitBytes(OpCode.OpConstant, this.makeConstant(obj));
  }

  resolveLocal(name: string): { index: number, isConst: boolean } {
    for (let i = this.locals.length - 1; i >= 0; i -= 1) {
      const local = this.locals[i];
      if (name === local.name) {
        if (local.depth === -1) {
          this.error('Cannot read local variable in its own initializer.');
        }
        return { index: i, isConst: local.isConst };
      }
    }

    return { index: -1, isConst: false };
  }

  addUpvalue(index: number, isLocal: boolean): number {
    for (let i = 0; i < this.func.upvalues.length; i += 1) {
      const upvalue = this.func.upvalues[i];
      if (upvalue.index === index && upvalue.isLocal === isLocal) {
        return i;
      }
    }

    if (this.func.upvalues.length === Number.MAX_SAFE_INTEGER) {
      this.error('Too many closure variables in function.');
      return 0;
    }

    this.func.upvalues.push(new UpValue(index, isLocal));
    return this.func.upvalues.length - 1;
  }

  resolveUpvalue(name: string): { index: number, isConst: boolean } {
    if (this.enclosing === null) return { index: -1, isConst: false };
    const { index: local } = this.enclosing.resolveLocal(name);
    if (local !== -1) {
      this.enclosing.locals[local].isCaptured = true;
      return { index: this.addUpvalue(local, true), isConst: this.enclosing.locals[local].isConst };
    }

    const { index: upvalue, isConst } = this.enclosing.resolveUpvalue(name);
    if (upvalue !== -1) {
      return { index: this.addUpvalue(upvalue, false), isConst };
    }

    return { index: -1, isConst: false };
  }

  namedVariable(name: string, canAssign: boolean, isInherit?: boolean): void {
    let getOp;
    let setOp;
    let idx;
    let isConstant;
    const local = this.resolveLocal(name);
    idx = local.index;
    isConstant = local.isConst;
    if (idx !== -1) {
      getOp = OpCode.OpGetLocal;
      setOp = OpCode.OpSetLocal;
    } else {
      const upvalue = this.resolveUpvalue(name);
      idx = upvalue.index;
      isConstant = upvalue.isConst;
      if (idx !== -1) {
        getOp = OpCode.OpGetUpvalue;
        setOp = OpCode.OpSetUpvalue;
      } else {
        isConstant = this.globalConsts.includes(name);
        idx = this.identifierConstant(name);
        getOp = OpCode.OpGetGlobal;
        setOp = OpCode.OpSetGlobal;
      }
    }

    if (canAssign && this.match(TokenType.TokenEqual)) {
      if (isConstant) {
        this.error(`Cannot reassign const ${name}`);
      }
      this.expression();
      this.emitBytes(setOp, idx);
    } else if (isInherit) {
      this.emitBytes(setOp, idx);
    } else {
      this.emitBytes(getOp, idx);
    }
  }

  argumentList(): number {
    let argCount = 0;
    if (!this.check(TokenType.TokenRightParen)) {
      do {
        this.expression();
        if (argCount === 255) {
          this.error('Cannot have more than 255 arguments.');
        }
        argCount += 1;
      } while (this.match(TokenType.TokenComma));
    }

    this.consume(TokenType.TokenRightParen, "Expect ')' after arguments.");
    return argCount;
  }

  call(): void {
    const argCount = this.argumentList();
    this.emitBytes(OpCode.OpCall, argCount);
  }

  map(): void {
    let argCount = 0;

    if (!this.check(TokenType.TokenRightBrace)) {
      do {
        if (this.match(TokenType.TokenIdentifier)) {
          const value = this.parser.previous.lexeme;
          this.emitConstant(new ObjString(value));
        } else {
          this.expression();
        }
        this.consume(TokenType.TokenColon, "Expect ':' after key.");
        this.expression();
        argCount += 1;
      } while (this.match(TokenType.TokenComma));
    }

    this.consume(TokenType.TokenRightBrace, "Expect '}' after arguments.");

    this.emitBytes(OpCode.OpMapInit, argCount);
  }

  arrayArgumentList(): number {
    let argCount = 0;
    if (!this.check(TokenType.TokenRightBracket)) {
      do {
        this.expression();
        argCount += 1;
      } while (this.match(TokenType.TokenComma));
    }

    this.consume(TokenType.TokenRightBracket, "Expect ']' after arguments.");
    return argCount;
  }

  array(): void {
    const argCount = this.arrayArgumentList();
    this.emitBytes(OpCode.OpArrayInit, argCount);
  }

  arraySetGet(canAssign: boolean): void {
    this.expression();
    this.consume(TokenType.TokenRightBracket, "Expect ']' after arguments.");
    if (canAssign && this.match(TokenType.TokenEqual)) {
      this.expression();
      this.emitByte(OpCode.OpArrayMapSet);
    } else {
      this.emitByte(OpCode.OpArrayMapGet);
    }
  }

  superr(): void {
    if (this.currentClass === null) {
      this.error("Cannot use 'super' outside of a class.");
    } else if (!this.currentClass.hasSuperclass) {
      this.error("Cannot use 'super' in a class with no superclass.");
    }

    let idConstant = null;
    if (this.check(TokenType.TokenLeftParen)) {
      if (this.type !== FunctionType.TypeInitializer) {
        this.error('Super calls are not permitted outside constructors or in nested functions inside constructors.');
      } else {
        idConstant = 'constructor';
      }
    } else {
      this.consume(TokenType.TokenDot, "Expect '.' after 'super'.");
      this.consume(TokenType.TokenIdentifier, 'Expect superclass method name.');
      idConstant = this.parser.previous.lexeme;
    }

    const name = this.identifierConstant(idConstant);

    this.namedVariable('this', false);
    if (this.match(TokenType.TokenLeftParen)) {
      const argCount = this.argumentList();
      this.namedVariable('super', false);
      this.emitBytes(OpCode.OpSuperInvoke, name);
      this.emitByte(argCount);
    } else {
      this.namedVariable('super', false);
      this.emitBytes(OpCode.OpGetSuper, name);
    }
  }

  variable(canAssign: boolean): void {
    this.namedVariable(this.parser.previous.lexeme, canAssign);
  }

  thiss(): void {
    if (this.currentClass === null) {
      this.error("Cannot use 'this' outside of a class.");
      return;
    }
    this.variable(false);
  }

  number(): void {
    const value = BigInt(this.parser.previous.lexeme);
    this.emitConstant(new ObjNumber(value));
  }

  string(): void {
    const value = this.parser.previous.lexeme;
    this.emitConstant(new ObjString(value));
  }

  grouping(): void {
    this.expression();
    this.consume(TokenType.TokenRightParen, 'Expect \')\' after expression.');
  }

  unary(): void {
    const operatorType = this.parser.previous.type;

    // Compile the operand.
    this.parsePrecedence(Precedence.PrecUnary);

    // Emit the operator instruction.
    switch (operatorType) {
      case TokenType.TokenBang: this.emitByte(OpCode.OpNot); break;
      case TokenType.TokenMinus: this.emitByte(OpCode.OpNegate); break;
      case TokenType.TokenBitwiseNot: this.emitByte(OpCode.OpBitwiseNot); break;
      default:
    }
  }

  binary(): void {
    // Remember the operator.
    const operatorType = this.parser.previous.type;

    // Compile the right operand.
    const rule = this.getRule(operatorType);
    this.parsePrecedence(rule.precedence + 1);

    // Emit the operator instruction.
    switch (operatorType) {
      case TokenType.TokenBangEqual: this.emitBytes(OpCode.OpEqual, OpCode.OpNot); break;
      case TokenType.TokenEqualEqual: this.emitByte(OpCode.OpEqual); break;
      case TokenType.TokenGreater: this.emitByte(OpCode.OpGreater); break;
      case TokenType.TokenGreaterEqual: this.emitBytes(OpCode.OpLess, OpCode.OpNot); break;
      case TokenType.TokenLess: this.emitByte(OpCode.OpLess); break;
      case TokenType.TokenLessEqual: this.emitBytes(OpCode.OpGreater, OpCode.OpNot); break;
      case TokenType.TokenPlus: this.emitByte(OpCode.OpAdd); break;
      case TokenType.TokenMinus: this.emitByte(OpCode.OpSubtract); break;
      case TokenType.TokenStar: this.emitByte(OpCode.OpMultiply); break;
      case TokenType.TokenSlash: this.emitByte(OpCode.OpDivide); break;
      case TokenType.TokenModulo: this.emitByte(OpCode.OpModulo); break;
      case TokenType.TokenExponent: this.emitByte(OpCode.OpExponent); break;
      case TokenType.TokenBitwiseAnd: this.emitByte(OpCode.OpBitwiseAnd); break;
      case TokenType.TokenBitwiseOr: this.emitByte(OpCode.OpBitwiseOr); break;
      case TokenType.TokenBitwiseNot: this.emitByte(OpCode.OpBitwiseNot); break;
      case TokenType.TokenBitwiseXor: this.emitByte(OpCode.OpBitwiseXor); break;
      case TokenType.TokenBitwiseShiftLeft: this.emitByte(OpCode.OpBitwiseShiftLeft); break;
      case TokenType.TokenBitwiseShiftRight: this.emitByte(OpCode.OpBitwiseShiftRight); break;
      default:
      //  Unreachable.
    }
  }

  literal(): void {
    switch (this.parser.previous.type) {
      case TokenType.TokenFalse: this.emitByte(OpCode.OpFalse); break;
      case TokenType.TokenNull: this.emitByte(OpCode.OpNull); break;
      case TokenType.TokenTrue: this.emitByte(OpCode.OpTrue); break;
      default:
      // Unreachable.
    }
  }

  dot(canAssign: boolean): void {
    this.consume(TokenType.TokenIdentifier, "Expect property name after '.'.");
    const name = this.identifierConstant(this.parser.previous.lexeme);

    if (canAssign && this.match(TokenType.TokenEqual)) {
      this.expression();
      this.emitBytes(OpCode.OpSetProperty, name);
    } else if (this.match(TokenType.TokenLeftParen)) {
      const argCount = this.argumentList();
      this.emitBytes(OpCode.OpInvoke, name);
      this.emitByte(argCount);
    } else {
      this.emitBytes(OpCode.OpGetProperty, name);
    }
  }

  and(): void {
    const endJump = this.emitJump(OpCode.OpJumpIfFalse);

    this.emitByte(OpCode.OpPop);
    this.parsePrecedence(Precedence.PrecAnd);

    this.patchJump(endJump);
  }

  or(): void {
    const elseJump = this.emitJump(OpCode.OpJumpIfFalse);
    const endJump = this.emitJump(OpCode.OpJump);

    this.patchJump(elseJump);
    this.emitByte(OpCode.OpPop);

    this.parsePrecedence(Precedence.PrecOr);
    this.patchJump(endJump);
  }

  getRule(type: TokenType): Rule {
    return this.rules.get(type);
  }

  parsePrecedence(precedence: Precedence): void {
    this.advance();

    // skip TokenNew
    if (this.parser.previous.type === TokenType.TokenNew) {
      this.advance();
    }

    const prefixRule = this.getRule(this.parser.previous.type).prefix;
    if (prefixRule === null) {
      this.error('Expect expression.');
      return;
    }

    const canAssign = precedence <= Precedence.PrecAssignment;
    // @ts-ignore
    this[prefixRule](canAssign);

    while (precedence <= this.getRule(this.parser.current.type).precedence) {
      this.advance();
      const infixRule = this.getRule(this.parser.previous.type).infix;
      // @ts-ignore
      this[infixRule](canAssign);
    }

    if (canAssign && this.match(TokenType.TokenEqual)) {
      this.error('Invalid assignment target.');
    }
  }

  check(type: TokenType): boolean {
    return this.parser.current.type === type;
  }

  match(type: TokenType): boolean {
    if (!this.check(type)) return false;
    this.advance();
    return true;
  }

  printStatement(): void {
    this.expression();
    this.consume(TokenType.TokenSemicolon, 'Expect \';\' after value.');
    this.emitByte(OpCode.OpPrint);
  }

  expressionStatement(): void {
    this.expression();
    this.consume(TokenType.TokenSemicolon, "Expect ';' after expression.");
    this.emitByte(OpCode.OpPop);
  }

  patchJump(offset: number): void {
    // -2 to adjust for the bytecode for the jump offset itself.
    const jump = this.currentChunk().code.length - offset - 1;

    if (jump > Number.MAX_SAFE_INTEGER) {
      this.error('Too much code to jump over.');
    }

    this.currentChunk().code[offset] = jump;
  }

  emitJump(instruction: OpCode, offset?: number): number {
    if (offset) {
      this.emitByte(instruction);
      this.emitByte(offset);
    } else {
      this.emitByte(instruction);
      this.emitByte(0);
    }

    return this.currentChunk().code.length - 1;
  }

  emitLoop(loopStart: number): void {
    this.emitByte(OpCode.OpLoop);

    const offset = this.currentChunk().code.length - loopStart + 1;
    if (offset > Number.MAX_SAFE_INTEGER) this.error('Loop body too large.');

    this.emitByte(offset);
  }

  ifStatement(): void {
    this.consume(TokenType.TokenLeftParen, "Expect '(' after 'if'.");
    this.expression();
    this.consume(TokenType.TokenRightParen, "Expect ')' after condition.");

    const thenJump = this.emitJump(OpCode.OpJumpIfFalse);

    this.emitByte(OpCode.OpPop);
    this.statement();

    const elseJump = this.emitJump(OpCode.OpJump);

    this.patchJump(thenJump);
    this.emitByte(OpCode.OpPop);

    if (this.match(TokenType.TokenElse)) {
      this.statement();
    }
    this.patchJump(elseJump);
  }

  whileStatement(): void {
    const loopStart = this.currentChunk().code.length;
    this.consume(TokenType.TokenLeftParen, "Expect '(' after 'while'.");
    this.expression();
    this.consume(TokenType.TokenRightParen, "Expect ')' after condition.");

    const exitJump = this.emitJump(OpCode.OpJumpIfFalse);

    this.emitByte(OpCode.OpPop);
    this.statement();

    this.emitLoop(loopStart);

    this.patchJump(exitJump);
    this.emitByte(OpCode.OpPop);
  }

  dowhileStatement(): void {
    const loopStart = this.currentChunk().code.length;

    this.statement();

    this.consume(TokenType.TokenWhile, "Expect 'while' after 'do'.");
    this.consume(TokenType.TokenLeftParen, "Expect '(' after 'while'.");
    this.expression();
    this.consume(TokenType.TokenRightParen, "Expect ')' after condition.");
    this.consume(TokenType.TokenSemicolon, "Expect ';' after loop condition.");
    this.emitJump(OpCode.OpJumpIfFalse, 2);
    this.emitLoop(loopStart);
    this.emitByte(OpCode.OpPop);
  }

  forStatement(): void {
    this.beginScope();
    this.consume(TokenType.TokenLeftParen, "Expect '(' after 'for'.");
    if (this.match(TokenType.TokenSemicolon)) {
      // No initializer.
    } else if (this.match(TokenType.TokenLet)) {
      this.varDeclaration();
    } else {
      this.expressionStatement();
    }

    let loopStart = this.currentChunk().code.length;

    let exitJump = -1;
    if (!this.match(TokenType.TokenSemicolon)) {
      this.expression();
      this.consume(TokenType.TokenSemicolon, "Expect ';' after loop condition.");

      // Jump out of the loop if the condition is false.
      exitJump = this.emitJump(OpCode.OpJumpIfFalse);
      this.emitByte(OpCode.OpPop); // Condition.
    }

    if (!this.match(TokenType.TokenRightParen)) {
      const bodyJump = this.emitJump(OpCode.OpJump);

      const incrementStart = this.currentChunk().code.length;
      this.expression();
      this.emitByte(OpCode.OpPop);
      this.consume(TokenType.TokenRightParen, "Expect ')' after for clauses.");

      this.emitLoop(loopStart);
      loopStart = incrementStart;
      this.patchJump(bodyJump);
    }

    this.statement();

    this.emitLoop(loopStart);

    if (exitJump !== -1) {
      this.patchJump(exitJump);
      this.emitByte(OpCode.OpPop); // Condition.
    }

    this.endScope();
  }

  returnStatement(): void {
    if (this.type === FunctionType.TypeScript) {
      this.error('Cannot return from top-level code.');
    }
    if (this.match(TokenType.TokenSemicolon)) {
      this.emitReturn();
    } else {
      if (this.type === FunctionType.TypeInitializer) {
        this.error('Cannot return a value from an initializer.');
      }
      this.expression();
      this.consume(TokenType.TokenSemicolon, "Expect ';' after return value.");
      this.emitByte(OpCode.OpReturn);
    }
  }

  block(): void {
    while (!this.check(TokenType.TokenRightBrace) && !this.check(TokenType.TokenEof)) {
      this.declaration();
    }

    this.consume(TokenType.TokenRightBrace, "Expect '}' after block.");
  }

  beginScope(): void {
    this.scopeDepth += 1;
  }

  endScope(): void {
    this.scopeDepth -= 1;

    while (this.locals.length > 0
      && this.locals[this.locals.length - 1].depth
      > this.scopeDepth) {
      if (this.locals[this.locals.length - 1].isCaptured) {
        this.emitByte(OpCode.OpCloseUpvalue);
      } else {
        this.emitByte(OpCode.OpPop);
      }
      this.locals.pop();
    }
  }

  statement(): void {
    if (this.match(TokenType.TokenPrint)) {
      this.printStatement();
    } else if (this.match(TokenType.TokenFor)) {
      this.forStatement();
    } else if (this.match(TokenType.TokenIf)) {
      this.ifStatement();
    } else if (this.match(TokenType.TokenReturn)) {
      this.returnStatement();
    } else if (this.match(TokenType.TokenDo)) {
      this.dowhileStatement();
    } else if (this.match(TokenType.TokenWhile)) {
      this.whileStatement();
    } else if (this.match(TokenType.TokenLeftBrace)) {
      this.beginScope();
      this.block();
      this.endScope();
    } else {
      this.expressionStatement();
    }
  }

  expression(): void {
    this.parsePrecedence(Precedence.PrecAssignment);
  }

  markInitialized(): void {
    if (this.scopeDepth === 0) return;
    this.locals[this.locals.length - 1].depth = this.scopeDepth;
  }

  defineVariable(global: number): void {
    if (this.scopeDepth > 0) {
      this.markInitialized();
      return;
    }
    this.emitBytes(OpCode.OpDefineGlobal, global);
  }

  identifierConstant(name: string): number {
    return this.makeConstant(new ObjString(name));
  }

  addLocal(name: string): void {
    if (this.locals.length === Number.MAX_SAFE_INTEGER) {
      this.error('Too many local variables in function.');
      return;
    }
    this.locals.push(new Local(name, -1, false, this.compilingConst));
  }

  declareVariable(): void {
    // Global variables are implicitly declared.
    if (this.scopeDepth === 0) return;

    const name = this.parser.previous.lexeme;

    for (let i = this.locals.length - 1; i >= 0; i -= 1) {
      const local = this.locals[i];
      if (local.depth !== -1 && local.depth < this.scopeDepth) {
        break;
      }

      if (name === local.name) {
        this.error('Variable with this name already declared in this scope.');
      }
    }

    this.addLocal(name);
  }

  parseVariable(errorMessage: string): number {
    this.consume(TokenType.TokenIdentifier, errorMessage);
    this.declareVariable();
    if (this.scopeDepth > 0) return 0;
    if (this.compilingConst) {
      this.globalConsts.push(this.parser.previous.lexeme);
    }
    return this.identifierConstant(this.parser.previous.lexeme);
  }

  varDeclaration(): void {
    const global = this.parseVariable('Expect variable name.');

    if (this.match(TokenType.TokenEqual)) {
      this.expression();
    } else {
      this.emitByte(OpCode.OpNull);
    }
    this.consume(TokenType.TokenSemicolon, "Expect ';' after variable declaration.");

    this.defineVariable(global);
  }

  fn(type: FunctionType): void {
    const compiler = new Compiler(type, this.scanner, this);
    compiler.beginScope();

    // Compile the parameter list.
    compiler.consume(TokenType.TokenLeftParen, "Expect '(' after function name.");

    if (!compiler.check(TokenType.TokenRightParen)) {
      do {
        compiler.func.arity += 1;
        if (compiler.func.arity > 255) {
          compiler.errorAtCurrent('Cannot have more than 255 parameters.');
        }

        const paramConstant = compiler.parseVariable('Expect parameter name.');
        compiler.defineVariable(paramConstant);
      } while (compiler.match(TokenType.TokenComma));
    }

    compiler.consume(TokenType.TokenRightParen, "Expect ')' after parameters.");

    // The body.
    compiler.consume(TokenType.TokenLeftBrace, "Expect '{' before function body.");
    compiler.block();

    // Create the function object.
    const func = compiler.endCompiler();

    this.emitBytes(OpCode.OpClosure, this.makeConstant(func));

    for (let i = 0; i < func.upvalues.length; i += 1) {
      this.emitByte(func.upvalues[i].isLocal ? 1 : 0);
      this.emitByte(func.upvalues[i].index);
    }
  }

  funDeclaration(): void {
    const global = this.parseVariable('Expect function name.');
    this.markInitialized();
    this.fn(FunctionType.TypeFunction);
    this.defineVariable(global);
  }

  method(): void {
    this.consume(TokenType.TokenIdentifier, 'Expect method name.');
    const constant = this.identifierConstant(this.parser.previous.lexeme);

    let type = FunctionType.TypeMethod;
    if (this.parser.previous.lexeme === 'constructor') {
      type = FunctionType.TypeInitializer;
    }
    this.fn(type);

    this.emitBytes(OpCode.OpMethod, constant);
  }

  classDeclaration(): void {
    this.consume(TokenType.TokenIdentifier, 'Expect class name.');
    const className = this.parser.previous.lexeme;
    const nameConstant = this.identifierConstant(className);
    this.declareVariable();

    this.emitBytes(OpCode.OpClass, nameConstant);
    this.defineVariable(nameConstant);

    const classCompiler = new ClassCompiler(className, this.currentClass);
    this.currentClass = classCompiler;

    if (this.match(TokenType.TokenExt)) {
      this.consume(TokenType.TokenIdentifier, 'Expect superclass name.');
      this.variable(false);
      if (className === this.parser.previous.lexeme) {
        this.error('A class cannot inherit from itself.');
      }
      this.beginScope();
      this.addLocal('super');
      this.defineVariable(0);
      this.namedVariable(className, false);
      this.emitByte(OpCode.OpInherit);
      this.namedVariable(className, true, true);
      classCompiler.hasSuperclass = true;
    } else {
      this.namedVariable(className, false);
    }


    this.consume(TokenType.TokenLeftBrace, "Expect '{' before class body.");
    while (!this.check(TokenType.TokenRightBrace) && !this.check(TokenType.TokenEof)) {
      this.method();
    }
    this.consume(TokenType.TokenRightBrace, "Expect '}' after class body.");
    this.emitByte(OpCode.OpPop);

    if (classCompiler.hasSuperclass) {
      this.endScope();
    }

    this.currentClass = this.currentClass.enclosing;
  }

  declaration(): void {
    if (this.match(TokenType.TokenClass)) {
      this.classDeclaration();
    } else if (this.match(TokenType.TokenFunction)) {
      this.funDeclaration();
    } else if (this.match(TokenType.TokenLet)) {
      this.varDeclaration();
    } else if (this.match(TokenType.TokenConst)) {
      this.compilingConst = true;
      this.varDeclaration();
      this.compilingConst = false;
    } else {
      this.statement();
    }

    if (this.parser.panicMode) this.synchronize();
  }

  synchronize(): void {
    this.parser.panicMode = false;

    while (this.parser.current.type !== TokenType.TokenEof) {
      if (this.parser.previous.type === TokenType.TokenSemicolon) return;

      switch (this.parser.current.type) {
        case TokenType.TokenClass:
        case TokenType.TokenFunction:
        case TokenType.TokenLet:
        case TokenType.TokenFor:
        case TokenType.TokenIf:
        case TokenType.TokenWhile:
        case TokenType.TokenPrint:
        case TokenType.TokenReturn:
          return;

        default:
        // Do nothing.
      }

      this.advance();
    }
  }

  compile(): ObjFunction {
    this.advance();

    while (!this.match(TokenType.TokenEof)) {
      this.declaration();
    }

    const func = this.endCompiler();

    return this.parser.hadError ? null : func;
  }
}

export default Compiler;
