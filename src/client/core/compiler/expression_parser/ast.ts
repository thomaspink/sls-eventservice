export class ParseSpan {
  constructor(public start: number, public end: number) {}
}

export class AST {
  constructor(public span: ParseSpan) {}
  toString(): string { return 'AST'; }
}

export class EmptyExpr extends AST { }

/**
 * Multiple expressions separated by a semicolon.
 */
export class Chain extends AST {
  constructor(span: ParseSpan, public expressions: any[]) { super(span); }
}

export class Conditional extends AST {
  constructor(span: ParseSpan, public condition: AST, public trueExp: AST, public falseExp: AST) {
    super(span);
  }
}

export class PropertyRead extends AST {
  constructor(span: ParseSpan, public receiver: AST, public name: string) { super(span); }
}

export class PropertyWrite extends AST {
  constructor(span: ParseSpan, public receiver: AST, public name: string, public value: AST) {
    super(span);
  }
}

export class KeyedRead extends AST {
  constructor(span: ParseSpan, public obj: AST, public key: AST) { super(span); }
}

export class KeyedWrite extends AST {
  constructor(span: ParseSpan, public obj: AST, public key: AST, public value: AST) { super(span); }
}

export class MethodCall extends AST {
  constructor(span: ParseSpan, public receiver: AST, public name: string, public args: any[]) {
    super(span);
  }
}

export class FunctionCall extends AST {
  constructor(span: ParseSpan, public target: AST|null, public args: any[]) { super(span); }
}
