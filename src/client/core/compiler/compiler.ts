import { Provider } from '../di/provider';
import { Reflector } from '../reflection/reflection';
import { RendererFactoryType } from '../linker/renderer';
import { ComponentResolver } from './component_resolver';
import { BindingCompiler } from './binding_compiler';
import { Lexer } from './expression_parser/lexer';
import { EXPRESSION_PARSER_PROVIDERS, ExpressionParser } from './expression_parser/expression_parser';
import { ComponentCompiler } from './component_compiler';
import { TemplateParser } from './template_parser/parser';

export const COMPILER_PROVIDER: Provider[] = [
  { provide: ComponentResolver, deps: [Reflector] },
  EXPRESSION_PARSER_PROVIDERS,
  { provide: BindingCompiler, deps: [ExpressionParser] }
];
