const fs = require('fs');
const { VM, InterpretResult } = require('../dist/index');

process.env.DEBUG_TRACE_EXECUTION = 'tru';
process.env.DEBUG_PRINT_CODE = 'tru';
process.env.BENCHMARK = 'tru';

async function run() {
  const argv = process.argv.slice(2);
  if (argv.length === 1) {
    const vm = new VM();
    const source = fs.readFileSync(argv[0]).toString();

    const func = VM.compile(source);

    if (!func) {
      process.exit(65);
    }

    const result = await vm.interpret(func);

    if (result === InterpretResult.InterpretCompileError) process.exit(65);
    if (result === InterpretResult.InterpretRuntimeError) process.exit(70);

    process.exit();
  } else {
    console.error('Usage: node index.js [path]');
    process.exit(64);
  }
}

run();
