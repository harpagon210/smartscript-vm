const enum TokenType {
  // Single-character tokens.
  TokenLeftParen,
  TokenRightParen,
  TokenLeftBrace,
  TokenRightBrace,
  TokenComma,
  TokenDot,
  TokenMinus,
  TokenPlus,
  TokenSemicolon,
  TokenSlash,
  TokenStar,

  // One or two character tokens.
  TokenBang,
  TokenBangEqual,
  TokenEqual,
  TokenEqualEqual,
  TokenGreater,
  TokenGreaterEqual,
  TokenLess,
  TokenLessEqual,

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
  TokenUndefined,
  TokenOr,
  TokenPrint,
  TokenReturn,
  TokenSuper,
  TokenThis,
  TokenTrue,
  TokenVar,
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
