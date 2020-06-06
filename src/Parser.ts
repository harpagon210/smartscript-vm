import { Token } from './Token';

class Parser {
  current: Token;

  previous: Token;

  hadError: boolean;

  panicMode: boolean;

  constructor() {
    this.current = null;
    this.previous = null;
    this.hadError = false;
    this.panicMode = false;
  }
}

export default Parser;
