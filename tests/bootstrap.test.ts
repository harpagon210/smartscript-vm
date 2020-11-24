import { VM } from "../src";

describe('bootstrap', () => {
  it('should compile normally', () => {
    const code: string = `
      print('test');
      print(3);
      print(true);
      print(null);
    `;
    const interpreter = new VM()
    interpreter.interpret(code);
  })
})
