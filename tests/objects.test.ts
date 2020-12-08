import { ObjBool, ObjFunction, ObjNativeFunction, ObjNull, ObjNumber, ObjString, VM } from "../src";

describe('objects', () => {
  it('should create an ObjBool true', async () => {
    const vm = new VM();

    let result: any;
    const setResultFn = () => {
      result = vm.pop();
      return new ObjNull();
    };
    vm.setGlobal('setResult', new ObjNativeFunction(setResultFn, 'setResult'));

    await vm.interpret(`
      const a = true;
      print(a);
      setResult(a);
    `)

    expect(result).toEqual(new ObjBool(true));
  })

  it('should create an ObjBool false', async () => {
    const vm = new VM();

    let result: any;
    const setResultFn = () => {
      result = vm.pop();
      return new ObjNull();
    };
    vm.setGlobal('setResult', new ObjNativeFunction(setResultFn, 'setResult'));

    await vm.interpret(`
      const a = false;
      print(a);
      setResult(a);
    `)

    expect(result).toEqual(new ObjBool(false));
  })

  it('should create an ObjNull', async () => {
    const vm = new VM();

    let result: any;
    const setResultFn = () => {
      result = vm.pop();
      return new ObjNull();
    };
    vm.setGlobal('setResult', new ObjNativeFunction(setResultFn, 'setResult'));

    await vm.interpret(`
      const a = null;
      print(a);
      setResult(a);
    `)

    expect(result).toEqual(new ObjNull());
  })

  it('should create an ObjString', async () => {
    const vm = new VM();

    let result: any;
    const setResultFn = () => {
      result = vm.pop();
      return new ObjNull();
    };
    vm.setGlobal('setResult', new ObjNativeFunction(setResultFn, 'setResult'));

    await vm.interpret(`
      const a = 'test';
      print(a);
      setResult(a);
    `)

    expect(result).toEqual(new ObjString('test'));

    const vm2 = new VM();

    let result2: any;
    const setResultFn2 = () => {
      result2 = vm2.pop();
      return new ObjNull();
    };
    vm2.setGlobal('setResult', new ObjNativeFunction(setResultFn2, 'setResult'));

    await vm2.interpret(`
      const a = "test";
      print(a);
      setResult(a);
    `)

    expect(result2).toEqual(new ObjString('test'));

    const vm3 = new VM();

    let result3: any;
    const setResultFn3 = () => {
      result3 = vm3.pop();
      return new ObjNull();
    };
    vm3.setGlobal('setResult', new ObjNativeFunction(setResultFn3, 'setResult'));

    await vm3.interpret(`
      const a = "multiline
      string";
      setResult(a);
    `)

    expect(result3).toEqual(new ObjString(`multiline
      string`));
  })

  it('should create an ObjNumber', async () => {
    const vm = new VM();

    let result: any;
    const setResultFn = () => {
      result = vm.pop();
      return new ObjNull();
    };
    vm.setGlobal('setResult', new ObjNativeFunction(setResultFn, 'setResult'));

    await vm.interpret(`
      const a = 1;
      print(a);
      setResult(a);
    `)

    expect(result).toEqual(new ObjNumber(1n));
  })

  it('should create a native function', async () => {
    const vm = new VM();

    let result: any;
    const setResultFn = () => {
      result = vm.pop();
      return new ObjNull();
    };
    vm.setGlobal('setResult', new ObjNativeFunction(setResultFn, 'setResult'));

    await vm.interpret(`
      print(setResult);
      setResult(1);
    `)

    expect(result).toEqual(new ObjNumber(1n));
  })

  it('should return from a function', async () => {
    const vm = new VM();

    let result: any;
    const setResultFn = () => {
      result = vm.pop();
      return new ObjNull();
    };
    vm.setGlobal('setResult', new ObjNativeFunction(setResultFn, 'setResult'));

    await vm.interpret(`
      function test() {
        return 1;
      }

      function test2() {
        return;
      }

      setResult(test());
    `)

    expect(result).toEqual(new ObjNumber(1n));
  })

  it('should serialize and deserialize an ObjFunction', async () => {
    let compileResult = VM.compile(`
      const a = 1;
      const b = true;
      const c = "test";
      const d = null;

      function testFunction () {
        return 1;
      }
    `);

    let serializedFunction = compileResult.func.serialize();
    expect(serializedFunction.name).toEqual(undefined);
    expect(serializedFunction.arity).toEqual(0);
    expect(serializedFunction.isConstant).toEqual(false);
    expect(serializedFunction.upvalues).toEqual([]);
    expect(serializedFunction.lines).toEqual([
      1, 1, 1, 1, 2, 2, 2,
      3, 3, 3, 3, 4, 4, 4,
      8, 8, 8, 8, 9, 9
    ]);
    expect(serializedFunction.code).toEqual([
      0, 1, 16, 0, 2, 16, 2,
      0, 4, 16, 3, 1, 16, 5,
      25, 7, 16, 6, 1, 14
    ]);

    expect(serializedFunction.constants).toEqual([
      { type: 'ObjString', value: 'a', isConstant: false },
      { type: 'ObjNumber', value: '1', isConstant: false },
      { type: 'ObjString', value: 'b', isConstant: false },
      { type: 'ObjString', value: 'c', isConstant: false },
      { type: 'ObjString', value: 'test', isConstant: false },
      { type: 'ObjString', value: 'd', isConstant: false },
      { type: 'ObjString', value: 'testFunction', isConstant: false },
      {
        type: 'ObjFunction', value: {
          name: 'testFunction',
          arity: 0,
          isConstant: false,
          upvalues: [],
          lines: [7, 7, 7, 8, 8],
          code: [0, 0, 14, 1, 14],
          constants: [
            { type: 'ObjNumber', value: '1', isConstant: false }
          ]
        }, isConstant: false
      }
    ]);

    const vm = new VM();

    let results: any = new Array();
    const setResultsFn = () => {
      results.push(vm.pop());
      return new ObjNull();
    };
    vm.setGlobal('setResults', new ObjNativeFunction(setResultsFn, 'setResults'));

    compileResult = VM.compile(`
      setResults(1+1);
      setResults("1"+"1");

      function test () {
        return 3 + 4;
      }

      setResults(test());
    `);

    serializedFunction = compileResult.func.serialize();

    const deserializedFunction = ObjFunction.deserialize(serializedFunction);

    await vm.interpret(deserializedFunction)

    expect(results[0]).toEqual(new ObjNumber(2n));
    expect(results[1]).toEqual(new ObjString("11"));
    expect(results[2]).toEqual(new ObjNumber(7n));

    compileResult = VM.compile(`
      {
        let a = 1;
        function f() {
          a = 3;
        }
      }
    `);

    serializedFunction = compileResult.func.serialize();

    expect(serializedFunction.constants[1].type).toEqual('ObjFunction');
    expect(serializedFunction.constants[1].value).toEqual({
      name: 'f',
      arity: 0,
      isConstant: false,
      upvalues: [{ index: 1, isLocal: true }],
      lines: [
        4, 4, 4, 4,
        4, 5, 5
      ],
      code: [
        0, 0, 27, 0,
        15, 1, 14
      ],
      constants: [{ type: 'ObjNumber', value: '3', isConstant: false }]
    });

    const deserializedFn = ObjFunction.deserialize(serializedFunction);

    expect(deserializedFn.chunk.constants[1] instanceof ObjFunction).toBeTruthy();

    compileResult = VM.compile(`
      const a = 1;
    `);

    try {
      compileResult.func.chunk.constants[0] = new ObjBool(true);

      serializedFunction = compileResult.func.serialize();
    } catch (error) {
      expect(error.message).toEqual('type ObjBool not supported in ObjFunction serialize method.');
    }

    compileResult = VM.compile(`
      const a = 1;
    `);

    try {
      serializedFunction = compileResult.func.serialize();
      serializedFunction.constants[0].type = 'ObjBool'

      ObjFunction.deserialize(serializedFunction);

    } catch (error) {
      expect(error.message).toEqual('type ObjBool not supported in ObjFunction deserialize method.');
    }
  })
})
