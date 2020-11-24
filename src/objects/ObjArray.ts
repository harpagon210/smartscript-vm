import Obj from './Obj';

class ObjArray implements Obj {
  val: Array<Obj>;

  constructor(values: Array<Obj>) {
    this.val = values;
  }

  set(index: bigint, value: Obj) {
    // @ts-ignore
    this.val[index] = value;
  }

  get(index: bigint|number): Obj {
    // @ts-ignore
    return this.val[index];
  }

  push(value: Obj) {
    this.val.push(value);
  }

  pop(): Obj {
    return this.val.pop();
  }

  unshift(value: Obj) {
    this.val.unshift(value);
  }

  shift(): Obj {
    return this.val.shift();
  }

  clear(): void {
    this.val = [];
  }

  length(): number {
    return this.val.length;
  }

  asString(): string {
    let output: string = 'Array [ ';
    for (let index = 0; index < this.val.length; index += 1) {
      if (index > 0) {
        output += ', ';
      }
      output += `${this.val[index].asString()}`;
    }
    output += ' ]';
    return output;
  }
}

export default ObjArray;
