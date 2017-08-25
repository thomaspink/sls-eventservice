import { AST } from './ast';

export abstract class ExpressionParser {
  abstract parseBinding(expression: string): AST;
  abstract parseEvent(expression: string): AST;
}
