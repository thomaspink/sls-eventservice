import {
  AstVisitor, AST, Binary, Chain, Conditional, FunctionCall, ImplicitReceiver, Interpolation,
  KeyedRead, KeyedWrite, LiteralMap, LiteralArray, LiteralPrimitive, MethodCall, BindingPipe,
  PrefixNot, NonNullAssert, PropertyRead, PropertyWrite, Quote, SafeMethodCall, SafePropertyRead
} from './ast';

export class RuntimeExpressionConverter implements AstVisitor {
  visitBinary(ast: Binary, context: any): any {

  }

  visitChain(ast: Chain, context: any): any {

  }

  visitConditional(ast: Conditional, context: any): any {

  }

  visitFunctionCall(ast: FunctionCall, context: any): any {

  }

  visitImplicitReceiver(ast: ImplicitReceiver, context: any): any {

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

  }

  visitPipe(ast: BindingPipe, context: any): any {

  }

  visitPrefixNot(ast: PrefixNot, context: any): any {

  }

  visitNonNullAssert(ast: NonNullAssert, context: any): any {

  }

  visitPropertyRead(ast: PropertyRead, context: any): any {
  }

  visitPropertyWrite(ast: PropertyWrite, context: any): any {

  }

  visitQuote(ast: Quote, context: any): any {

  }

  visitSafeMethodCall(ast: SafeMethodCall, context: any): any {

  }

  visitSafePropertyRead(ast: SafePropertyRead, context: any): any {

  }

  visit?(ast: AST, context?: any): any {

  }

}

/*
function(context, $event) {
  context.onClick($event)
}
*/
