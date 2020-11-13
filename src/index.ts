import * as fs from 'fs';
import VM from './VM';
import InterpretResult from './InterpretResult';

process.env.DEBUG_TRACE_EXECUTION = 'true';
process.env.DEBUG_PRINT_CODE = 'true';
process.env.BENCHMARK = 'tru';

const argv = process.argv.slice(2);
if (argv.length === 1) {
  const vm = new VM();
  const source = fs.readFileSync(argv[0]).toString();

  const func = VM.compile(source);

  const result = vm.interpret(func);

  if (result === InterpretResult.InterpretCompileError) process.exit(65);
  if (result === InterpretResult.InterpretRuntimeError) process.exit(70);

  process.exit();
} else {
  // eslint-disable-next-line no-console
  console.error('Usage: node index.js [path]');
  process.exit(64);
}
