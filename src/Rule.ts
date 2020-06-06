import Precedence from './Precedence';

class Rule {
  prefix: string;

  infix: string;

  precedence: Precedence;

  constructor(prefix: string, infix: string, precedence: Precedence) {
    this.prefix = prefix;
    this.infix = infix;
    this.precedence = precedence;
  }
}

export default Rule;
