class Local {
  name: string;

  depth: number;

  isCaptured: boolean;

  constructor(name: string, depth: number, isCaptured: boolean) {
    this.name = name;
    this.depth = depth;
    this.isCaptured = isCaptured;
  }
}

export default Local;
