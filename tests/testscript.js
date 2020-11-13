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

let start = clock();
print(fibonacci(1000));
print(clock() - start);