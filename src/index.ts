import VM from './VM';

process.env.DEBUG_TRACE_EXECUTION = 'tru';
process.env.DEBUG_PRINT_CODE = 'true';
process.env.BENCHMARK = 'tru';

const code = `function fibonacci(num){
  let a = 1;
  let b = 0; 
  let temp;

  while (num >= 0){
    temp = a;
    a = a + b;
    b = temp;
    num = num - 1;
  }

  return b;
}

let start = clock();
print(fibonacci(1000));
print(clock() - start);`;

const vm = new VM();
vm.interpret(code);
