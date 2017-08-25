import { ASTWithSource } from './ast';
import { InterpolationConfig } from '../interpolation_config';

/**
 * The expression parser convertes expressions in
 * bindings, events, ... to an abstract syntax tree (AST)
 */
export abstract class ExpressionParser {
  abstract parseAction(input: string, location: string,
    interpolationConfig?: InterpolationConfig): ASTWithSource;
  abstract parseBinding(input: string, location: string,
    interpolationConfig?: InterpolationConfig): ASTWithSource;
}
