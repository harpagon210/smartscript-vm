import BigNumber from 'bignumber.js';
import Obj from './Obj';

class ObjNumber implements Obj {
  val: BigNumber;

  constructor(num: BigNumber) {
    this.val = num;
  }

  asString(): string {
    return `${this.val}`;
  }
}

export default ObjNumber;
