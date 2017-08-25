import { Provider } from '../di/provider';
import { Reflector } from '../reflection/reflection';
import { RendererFactoryType } from '../linker/renderer';
import { ComponentResolver } from './component_resolver';
import { BindingCompiler } from './binding_compiler';
import { ExpressionParser } from './expression_parser/api';
import { SimpleExpressionParser } from './expression_parser/simple_parser';
import { Lexer } from './expression_parser/lexer';
import { SuperExpressionParser } from './expression_parser/parser';
import { ComponentCompiler } from './component_compiler';

export const COMPILER_PROVIDER: Provider[] = [
  { provide: ComponentResolver, deps: [Reflector] },
  { provide: ExpressionParser, useClass: SimpleExpressionParser, deps: [] },
  // { provide: Lexer, deps: [] },
  // { provide: ExpressionParser, useClass: SuperExpressionParser, deps: [Lexer] },
  { provide: BindingCompiler, deps: [ExpressionParser] },
  { provide: ComponentCompiler, deps: [ComponentResolver, BindingCompiler, RendererFactoryType] }
];
export { ComponentCompiler };
