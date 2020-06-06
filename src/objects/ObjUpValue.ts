import Obj from './Obj';

class ObjUpValue {
  location: number;

  closed: Obj;

  next: ObjUpValue;

  constructor(location: number) {
    this.location = location;
    this.closed = null;
    this.next = null;
  }
}

export default ObjUpValue;
