import VM from './VM';
import InterpretResult from './InterpretResult';
import ObjFunction from './objects/ObjFunction';
import ObjArray from './objects/ObjArray';
import ObjBool from './objects/ObjBool';
import ObjNativeClass from './objects/ObjNativeClass';
import ObjNativeFunction from './objects/ObjNativeFunction';
import ObjNull from './objects/ObjNull';
import ObjNumber from './objects/ObjNumber';
import ObjInstance from './objects/ObjInstance';
import ObjString from './objects/ObjString';
import ArrayClass from './nativeclasses/Array';
import MapClass from './nativeclasses/Map';
import OpCode from './OpCode';

export {
  VM, InterpretResult,
  ObjFunction, ObjArray, ObjBool, ObjNativeClass,
  ObjNativeFunction, ObjNull, ObjNumber, ObjInstance, ObjString,
  ArrayClass, MapClass, OpCode,
};
