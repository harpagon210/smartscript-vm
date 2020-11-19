class Local {
  name: string;

  depth: number;

  isCaptured: boolean;

  isConst: boolean;

  constructor(name: string, depth: number, isCaptured: boolean, isConst: boolean) {
    this.name = name;
    this.depth = depth;
    this.isCaptured = isCaptured;
    this.isConst = isConst;
  }
}

export default Local;
