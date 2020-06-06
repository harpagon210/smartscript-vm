class ClassCompiler {
  name: string;

  enclosing?: ClassCompiler;

  hasSuperclass: boolean;

  constructor(name: string, enclosing?: ClassCompiler) {
    this.enclosing = enclosing;
    this.name = name;
    this.hasSuperclass = false;
  }
}

export default ClassCompiler;
