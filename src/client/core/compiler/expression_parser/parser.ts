import { AST } from './ast';

/**
 * The expression parser convertes expressions in
 * bindings, events, ... to an abstract syntax tree (AST)
 */
export abstract class ExpressionParser {
  abstract parseBinding(expression: string): AST;
  abstract parseEvent(expression: string): AST;
}
