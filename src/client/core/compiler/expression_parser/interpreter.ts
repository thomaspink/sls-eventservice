import {stringify} from '../../util';
import {
  AstVisitor, AST, Binary, Chain, Conditional, FunctionCall, ImplicitReceiver, Interpolation,
  KeyedRead, KeyedWrite, LiteralMap, LiteralArray, LiteralPrimitive, MethodCall, BindingPipe,
  PrefixNot, NonNullAssert, PropertyRead, PropertyWrite, Quote, SafeMethodCall, SafePropertyRead
} from './ast';
import {ViewData} from '../../view/types';

export class ExpressionInterpreter implements AstVisitor {
  visitBinary(ast: Binary, context: ExpressionContext): any {
    throw new Error(`Binaries not yet supported in expressions`);
  }

  visitChain(ast: Chain, context: ExpressionContext): any {
    return this.visitAll(ast.expressions, context);
  }

  visitConditional(ast: Conditional, context: ExpressionContext): any {
    throw new Error(`Conditionals not yet supported in expressions`);
  }

  visitFunctionCall(ast: FunctionCall, context: ExpressionContext): any {
    throw new Error(`Function calls not yet supported in expressions`);
  }

  visitImplicitReceiver(ast: ImplicitReceiver, context: ExpressionContext): any {
    return null;
  }

  visitInterpolation(ast: Interpolation, context: ExpressionContext): any {
    throw new Error(`Interpolation not yet supported in expressions`);
  }

  visitKeyedRead(ast: KeyedRead, context: ExpressionContext): any {
    throw new Error(`KeyedRead not yet supported in expressions`);

  }

  visitKeyedWrite(ast: KeyedWrite, context: ExpressionContext): any {
    throw new Error(`KeyedWrite not yet supported in expressions`);
  }

  visitLiteralArray(ast: LiteralArray, context: ExpressionContext): any {
    throw new Error(`Arrays not yet supported in expressions`);
  }

  visitLiteralMap(ast: LiteralMap, context: ExpressionContext): any {
    throw new Error(`Maps not yet supported in expressions`);
  }

  visitLiteralPrimitive(ast: LiteralPrimitive, context: ExpressionContext): any {
    throw new Error(`Primitives not yet supported in expressions`);
  }

  visitMethodCall(ast: MethodCall, context: ExpressionContext): any {
    const fn = this.visitPropertyRead(ast, context);
    let args = [];
    if (ast.args) {
      args = this.visitAll(ast.args, context);
    }
    return fn.apply(fn, args);
  }

  visitPipe(ast: BindingPipe, context: ExpressionContext): any {

  }

  visitPrefixNot(ast: PrefixNot, context: ExpressionContext): any {

  }

  visitNonNullAssert(ast: NonNullAssert, context: ExpressionContext): any {

  }

  visitPropertyRead(ast: PropertyRead, context: ExpressionContext): any {
    const receiver = ast.receiver.visit(this, context);
    if (receiver === null) {
      return context.get(ast.name);
    }
    return receiver[ast.name];
  }

  visitPropertyWrite(ast: PropertyWrite, context: ExpressionContext): any {
    throw new Error(`Property write not yet supported in expressions`);
  }

  visitQuote(ast: Quote, context: ExpressionContext): any {
    throw new Error(`Quotes not yet supported in expressions`);
  }

  visitSafeMethodCall(ast: SafeMethodCall, context: ExpressionContext): any {
    return this.visitMethodCall(ast, context);
  }

  visitSafePropertyRead(ast: SafePropertyRead, context: ExpressionContext): any {
    return this.visitPropertyRead(ast, context);
  }

  visitAll(asts: AST[], context: ExpressionContext): any {
    return asts.map(ast => this.visit(ast, context));
  }

  visit(ast: AST, context: ExpressionContext): any {
    return ast.visit(this, context);
  }
}

export class ExpressionContext {
  constructor(private view: ViewData, private vars: {[name: string]: any} = {}) { }
  get(name: string) {
    let result: any = this.vars[name];
    if (typeof result !== 'undefined') {
      return result;
    }
    if (this.view.context) {
      result = this.view.context[name];
    }
    if (typeof result !== 'undefined') {
      return result;
    }
    result = this.view.component[name];
    if (typeof result !== 'undefined') {
      return result;
    }
    throw new Error(`${name} can not be found while resolving expression ${stringify(this.view.component)}`);
  }
}
