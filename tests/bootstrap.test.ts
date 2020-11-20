import { VM } from '../src/index';

const code: string = "const msg = 'fisrt build';";

describe('testing src/index.ts', () => {
  it('should compile normally', () => {
    const interpreter = new VM()
    interpreter.interpret(code);
  })

  it.skip('should support sandbox mode', () => {
    const interpreter = new VM()
    let error;
    
    try {
      interpreter.interpret(`
      this.y2 = 6n
    `)

    } catch (err) {
      error = err
    }

    expect(error).toBeInstanceOf(TypeError)
  })
})
