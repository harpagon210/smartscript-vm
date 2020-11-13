const { performance } = require('perf_hooks');

function fibonacci(num){
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

let start = performance.now();
console.log(fibonacci(1000));
console.log(performance.now() - start);
