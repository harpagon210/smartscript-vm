import { Token, TokenType } from './Token';

class Scanner {
  source: string;

  start: number;

  current: number;

  line: number;

  constructor(source: string) {
    this.source = source;
    this.start = 0;
    this.current = 0;
    this.line = 1;
  }

  isAtEnd(): boolean {
    return this.source[this.current] === '\0' || this.source[this.current] === null || this.source[this.current] === undefined;
  }

  makeToken(type: TokenType): Token {
    return new Token(type, this.source.substring(this.start, this.current), this.line);
  }

  makeStringToken(type: TokenType): Token {
    return new Token(type, this.source.substring(this.start + 1, this.current - 1), this.line);
  }

  errorToken(message: string): Token {
    return new Token(TokenType.TokenError, message, this.line);
  }

  advance(): string {
    this.current += 1;
    return this.source[this.current - 1];
  }

  match(expected: string): boolean {
    if (this.isAtEnd()) return false;
    if (this.source[this.current] !== expected) return false;

    this.current += 1;
    return true;
  }

  peek(): string {
    return this.source[this.current];
  }

  peekNext(): string {
    if (this.isAtEnd()) return '\0';
    return this.source[this.current + 1];
  }

  skipWhitespace(): void {
    for (; ;) {
      const c = this.peek();
      switch (c) {
        case ' ':
        case '\r':
        case '\t':
          this.advance();
          break;
        case '\n':
          this.line += 1;
          this.advance();
          break;
        case '/':
          if (this.peekNext() === '/') {
            // A comment goes until the end of the line.
            while (this.peek() !== '\n' && !this.isAtEnd()) this.advance();
          } else {
            return;
          }
          break;
        default:
          return;
      }
    }
  }

  string(char: string): Token {
    while (this.peek() !== char && !this.isAtEnd()) {
      if (this.peek() === '\n') this.line += 1;
      this.advance();
    }

    if (this.isAtEnd()) return this.errorToken('Unterminated string.');

    // The closing quote.
    this.advance();
    return this.makeStringToken(TokenType.TokenString);
  }

  static isDigit(c: string): boolean {
    return c >= '0' && c <= '9';
  }

  static isAlpha(c: string): boolean {
    return (c >= 'a' && c <= 'z')
      || (c >= 'A' && c <= 'Z')
      || c === '_';
  }

  number(): Token {
    while (Scanner.isDigit(this.peek())) this.advance();

    return this.makeToken(TokenType.TokenNumber);
  }

  checkKeyword(start: number, length: number, rest: string, type: TokenType): TokenType {
    if (this.current - this.start === start + length
      && this.source.substring(this.start + start, this.current) === rest) {
      return type;
    }

    return TokenType.TokenIdentifier;
  }

  identifierType(): TokenType {
    switch (this.source[this.start]) {
      case 'a': return this.checkKeyword(1, 2, 'nd', TokenType.TokenAnd);
      case 'c': return this.checkKeyword(1, 4, 'lass', TokenType.TokenClass);
      case 'e':
        if (this.current - this.start > 1) {
          switch (this.source[this.start + 1]) {
            case 'l': return this.checkKeyword(2, 2, 'se', TokenType.TokenElse);
            case 'x': return this.checkKeyword(2, 5, 'tends', TokenType.TokenExt);
            default: return TokenType.TokenIdentifier;
          }
        } else {
          return TokenType.TokenIdentifier;
        }
      case 'f':
        if (this.current - this.start > 1) {
          switch (this.source[this.start + 1]) {
            case 'a': return this.checkKeyword(2, 3, 'lse', TokenType.TokenFalse);
            case 'o': return this.checkKeyword(2, 1, 'r', TokenType.TokenFor);
            case 'u': return this.checkKeyword(2, 6, 'nction', TokenType.TokenFunction);
            default: return TokenType.TokenIdentifier;
          }
        } else {
          return TokenType.TokenIdentifier;
        }
      case 'i': return this.checkKeyword(1, 1, 'f', TokenType.TokenIf);
      case 'l': return this.checkKeyword(1, 2, 'et', TokenType.TokenVar);
      case 'n':
        if (this.current - this.start > 1) {
          switch (this.source[this.start + 1]) {
            case 'e': return this.checkKeyword(2, 1, 'w', TokenType.TokenNew);
            case 'u': return this.checkKeyword(2, 2, 'll', TokenType.TokenNull);
            default: return TokenType.TokenIdentifier;
          }
        } else {
          return TokenType.TokenIdentifier;
        }
      case 'o': return this.checkKeyword(1, 1, 'r', TokenType.TokenOr);
      case 'p': return this.checkKeyword(1, 4, 'rint', TokenType.TokenPrint);
      case 'r': return this.checkKeyword(1, 5, 'eturn', TokenType.TokenReturn);
      case 's': return this.checkKeyword(1, 4, 'uper', TokenType.TokenSuper);
      case 't':
        if (this.current - this.start > 1) {
          switch (this.source[this.start + 1]) {
            case 'h': return this.checkKeyword(2, 2, 'is', TokenType.TokenThis);
            case 'r': return this.checkKeyword(2, 2, 'ue', TokenType.TokenTrue);
            default: return TokenType.TokenIdentifier;
          }
        } else {
          return TokenType.TokenIdentifier;
        }
      case 'w': return this.checkKeyword(1, 4, 'hile', TokenType.TokenWhile);
      default: return TokenType.TokenIdentifier;
    }
  }

  identifier(): Token {
    while (Scanner.isAlpha(this.peek()) || Scanner.isDigit(this.peek())) this.advance();

    return this.makeToken(this.identifierType());
  }

  scanToken(): Token {
    this.skipWhitespace();
    this.start = this.current;

    if (this.isAtEnd()) return this.makeToken(TokenType.TokenEof);

    const c = this.advance();

    if (Scanner.isAlpha(c)) return this.identifier();
    if (Scanner.isDigit(c)) return this.number();

    switch (c) {
      case '(': return this.makeToken(TokenType.TokenLeftParen);
      case ')': return this.makeToken(TokenType.TokenRightParen);
      case '{': return this.makeToken(TokenType.TokenLeftBrace);
      case '}': return this.makeToken(TokenType.TokenRightBrace);
      case '[': return this.makeToken(TokenType.TokenLeftBracket);
      case ']': return this.makeToken(TokenType.TokenRightBracket);
      case ';': return this.makeToken(TokenType.TokenSemicolon);
      case ':': return this.makeToken(TokenType.TokenColon);
      case ',': return this.makeToken(TokenType.TokenComma);
      case '.': return this.makeToken(TokenType.TokenDot);
      case '-': return this.makeToken(TokenType.TokenMinus);
      case '+': return this.makeToken(TokenType.TokenPlus);
      case '/': return this.makeToken(TokenType.TokenSlash);
      case '*': return this.makeToken(TokenType.TokenStar);
      case '!':
        return this.makeToken(this.match('=') ? TokenType.TokenBangEqual : TokenType.TokenBang);
      case '=':
        return this.makeToken(this.match('=') ? TokenType.TokenEqualEqual : TokenType.TokenEqual);
      case '<':
        return this.makeToken(this.match('=') ? TokenType.TokenLessEqual : TokenType.TokenLess);
      case '>':
        return this.makeToken(this.match('=')
          ? TokenType.TokenGreaterEqual : TokenType.TokenGreater);
      case '"':
        return this.string('"');
      case "'":
        return this.string("'");
      default:
        return this.errorToken('Unexpected character.');
    }
  }
}

export default Scanner;
