import { Provider } from '../di/provider';
import { Reflector } from '../reflection/reflection';

// Compiler Dependecies
import { ComponentResolver } from '../compiler/component_resolver';
import { ComponentCompiler } from '../compiler/component_compiler';
// import { BindingCompiler } from '../compiler/binding_compiler';
// import { ExpressionParser } from '../compiler/expression_parser/expression_parser';

// Runtime Compiler Provider
// import { EXPRESSION_PARSER_PROVIDERS } from './expression_parser';
import { METADATA_RESOLVER_PROVIDER } from './metadata_resolver';
import { VIEW_COMPILER_PROVIDER } from './view_compiler';
import { JIT_COMPILER_PROVIDER } from './jit_compiler';
import {TEMPLATE_PARSER_PROVIDER} from './template_parser/parser';

export { ComponentCompiler };

export const COMPILER_PROVIDER: Provider[] = [
  { provide: ComponentResolver, deps: [Reflector] },
  // EXPRESSION_PARSER_PROVIDERS,
  // { provide: BindingCompiler, deps: [ExpressionParser] },
  TEMPLATE_PARSER_PROVIDER,
  VIEW_COMPILER_PROVIDER,
  METADATA_RESOLVER_PROVIDER,
  JIT_COMPILER_PROVIDER
];
