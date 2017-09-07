import { Provider } from '../../di/provider';
import { ASTWithSource } from './ast';
import { InterpolationConfig } from '../interpolation_config';
import { Lexer } from './lexer';
import { ExpressionParser_ } from './parser';

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

export const EXPRESSION_PARSER_PROVIDERS: Provider[] = [
  { provide: Lexer, deps: [] },
  { provide: ExpressionParser, useClass: ExpressionParser_, deps: [Lexer] }
];
