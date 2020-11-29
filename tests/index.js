const { VM, InterpretResult, ObjNativeClass, ObjInstance, ObjString, ObjNumber, MapClass } = require('../dist/index');

process.env.DEBUG_TRACE_EXECUTION = 'tru';
process.env.DEBUG_PRINT_CODE = 'tru';
process.env.BENCHMARK = 'tru';

async function run() {
    const vm = new VM();

    const ApiClass = new ObjNativeClass('Api', true);

    ApiClass.asStringNative = () => 'API';
    const apiInstance = new ObjInstance(ApiClass, true);
    apiInstance.setField('sender', new ObjString('Harpagon', true));
    apiInstance.setField('action', new ObjString('testAction', true));
    const params = new ObjInstance(MapClass, true);
    params.setField('nb', new ObjNumber(3n, true));
    apiInstance.setField('params', params);

    vm.setGlobal('Api', apiInstance);

    const source = `
    print(Api.sender);
    Api.sender = 'me';
    print(Api.sender);
    `;

    let result = VM.compile(source);

    if (!result.result === InterpretResult.InterpretCompileError) {
      console.error(result.errors);
      process.exit(65);
    }

    result = await vm.interpret(result.func);

    if (result.result === InterpretResult.InterpretRuntimeError) {
      console.error(result.errors);
      process.exit(70);
    }

    process.exit();
}

run();
