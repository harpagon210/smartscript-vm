let globalOne;
let globalTwo;

function main() {
  for (let a = 1; a <= 2; a = a + 1) {
    function closure() {
      print(a);
    }
    if (globalOne == null) {
      globalOne = closure;
    } else {
      globalTwo = closure;
    }
  }
}

main();
globalOne();
globalTwo();