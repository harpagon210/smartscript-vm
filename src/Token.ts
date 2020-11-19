const enum TokenType {
  // Single-character tokens.
  TokenLeftParen,
  TokenRightParen,
  TokenLeftBrace,
  TokenRightBrace,
  TokenLeftBracket,
  TokenRightBracket,
  TokenComma,
  TokenDot,
  TokenMinus,
  TokenPlus,
  TokenSemicolon,
  TokenColon,
  TokenSlash,
  TokenStar,
  TokenModulo,
  TokenBitwiseXor,
  TokenBitwiseNot,
  TokenBitwiseAnd,
  TokenBitwiseOr,

  // One or two character tokens.
  TokenBang,
  TokenBangEqual,
  TokenEqual,
  TokenEqualEqual,
  TokenGreater,
  TokenGreaterEqual,
  TokenLess,
  TokenLessEqual,
  TokenExponent,
  TokenBitwiseShiftLeft,
  TokenBitwiseShiftRight,

  // Literals.
  TokenIdentifier,
  TokenString,
  TokenNumber,

  // Keywords.
  TokenAnd,
  TokenClass,
  TokenElse,
  TokenFalse,
  TokenFor,
  TokenFunction,
  TokenIf,
  TokenNull,
  TokenOr,
  TokenPrint,
  TokenReturn,
  TokenSuper,
  TokenThis,
  TokenTrue,
  TokenLet,
  TokenWhile,
  TokenNew,
  TokenExt,

  TokenError,
  TokenEof,
}

class Token {
  type: TokenType;

  lexeme: string;

  line: number;

  constructor(type: TokenType, lexeme: string, line: number) {
    this.type = type;
    this.lexeme = lexeme;
    this.line = line;
  }
}

export { TokenType, Token };
