import { Provider } from '../di/provider';
import { ReflectionCapabilities } from './reflection_capabilities';
import { Reflector } from './reflector';

export const REFLECTIVE_PROVIDERS: Provider[] = [
  { provide: ReflectionCapabilities, deps: [] },
  { provide: Reflector, deps: [ReflectionCapabilities] },
];
export { Reflector };
