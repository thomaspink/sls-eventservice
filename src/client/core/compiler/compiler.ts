import { Provider } from '../di/provider';
import { Reflector } from '../reflection/reflection';
import { ComponentResolver } from './component_resolver';
import { ComponentCompiler } from './component_compiler';

export const COMPILER_PROVIDER: Provider[] = [
  { provide: ComponentResolver, deps: [Reflector] },
  { provide: ComponentCompiler, deps: [ComponentResolver] }
];
export { ComponentCompiler };
