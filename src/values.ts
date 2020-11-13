import Obj from './objects/Obj';

enum FunctionType {
  TypeFunction,
  TypeScript,
  TypeMethod,
  TypeInitializer,
}

const printObj = (obj: Obj): string => {
  // console.log(obj);
  return obj.asString();
};

export {
  FunctionType, printObj,
};
