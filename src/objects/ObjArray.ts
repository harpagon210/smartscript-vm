import Obj from './Obj';

class ObjArray implements Obj {
  val: Array<Obj>;

  constructor(values: Array<Obj>) {
    this.val = values;
  }

  set(index: number, value: Obj) {
    this.val[index] = value;
  }

  get(index: number): Obj {
    return this.val[index];
  }

  length(): number {
    return this.val.length;
  }

  asString(): string {
    let output: string = 'array[';
    for (let index = 0; index < this.val.length; index += 1) {
      if (index > 0) {
        output += ',';
      }
      output += `${this.val[index].asString()}`;
    }
    output += ']';
    return output;
  }
}

export default ObjArray;
