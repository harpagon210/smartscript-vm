class UpValue {
  index: number;

  isLocal: boolean;

  constructor(index: number, isLocal: boolean) {
    this.index = index;
    this.isLocal = isLocal;
  }
}

export default UpValue;
