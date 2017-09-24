import {Provider} from '../di/provider';
import {NodeWalker} from './node_walker';
import {RENDERER_FACTORY_PROVIDER} from './dom_renderer';

export const PLATFORM_BROWSER_PROVIDER: Provider[] = [
  {provide: NodeWalker, deps: []},
  RENDERER_FACTORY_PROVIDER
];
