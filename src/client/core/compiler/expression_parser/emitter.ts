import {
  AstVisitor, AST, Binary, Chain, Conditional, FunctionCall, ImplicitReceiver, Interpolation,
  KeyedRead, KeyedWrite, LiteralMap, LiteralArray, LiteralPrimitive, MethodCall, BindingPipe,
  PrefixNot, NonNullAssert, PropertyRead, PropertyWrite, Quote, SafeMethodCall, SafePropertyRead
} from './ast';

export class RuntimeEmitterVisitor implements AstVisitor {
  visitBinary(ast: Binary, context: any): any {

  }

  visitChain(ast: Chain, context: any): any {

  }

  visitConditional(ast: Conditional, context: any): any {

  }

  visitFunctionCall(ast: FunctionCall, context: any): any {

  }

  visitImplicitReceiver(ast: ImplicitReceiver, context: any): any {
    return null;
  }

  visitInterpolation(ast: Interpolation, context: any): any {

  }

  visitKeyedRead(ast: KeyedRead, context: any): any {

  }

  visitKeyedWrite(ast: KeyedWrite, context: any): any {

  }

  visitLiteralArray(ast: LiteralArray, context: any): any {

  }

  visitLiteralMap(ast: LiteralMap, context: any): any {

  }

  visitLiteralPrimitive(ast: LiteralPrimitive, context: any): any {

  }

  visitMethodCall(ast: MethodCall, context: any): any {
    const r = ast.receiver.visit(this, context);
    const a = ast.args.map(arg => arg.visit(this, context)).join(',');
    if (r === null) {
      return `context.${ast.name}(a);`;
    }
  }

  visitPipe(ast: BindingPipe, context: any): any {

  }

  visitPrefixNot(ast: PrefixNot, context: any): any {

  }

  visitNonNullAssert(ast: NonNullAssert, context: any): any {

  }

  visitPropertyRead(ast: PropertyRead, context: any): any {
    const r = ast.receiver.visit(this, context);
    const ctx = r || context;
    return ctx[ast.name];
    // return ast.name === '$event' ? ast.name : `context.${ast.name};`;
  }

  visitPropertyWrite(ast: PropertyWrite, context: any): any {
    const r = ast.receiver.visit(this, context);
    const ctx = r || context;
    ctx[ast.name] = ast.value.visit(this, context);
  }

  visitQuote(ast: Quote, context: any): any {

  }

  visitSafeMethodCall(ast: SafeMethodCall, context: any): any {
    return this.visitMethodCall(ast, context);
  }

  visitSafePropertyRead(ast: SafePropertyRead, context: any): any {
    return this.visitPropertyRead(ast, context);
  }

  visitAll(asts: AST[]): any { return asts.map(ast => this.visit(ast)); }

  visit(ast: AST, context?: any): any {
    return ast.visit(this, context);
  }

}

/*
function(context, $event) {
  context.onClick($event)
}
*/
