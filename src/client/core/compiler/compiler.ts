import { Provider } from '../di/provider';
import { Reflector } from '../reflection/reflection';
import { ComponentResolver } from './component_resolver';
import { BindingCompiler } from './binding_compiler';
import { EXPRESSION_PARSER_PROVIDERS, ExpressionParser } from './expression_parser/expression_parser';

export const COMPILER_PROVIDER: Provider[] = [
  { provide: ComponentResolver, deps: [Reflector] },
  EXPRESSION_PARSER_PROVIDERS,
  { provide: BindingCompiler, deps: [ExpressionParser] }
];
