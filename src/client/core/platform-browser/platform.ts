import { Provider } from '../di/provider';
import { NodeWalker } from './node_walker';
import { DomRendererFactory } from './dom_renderer';
import { RendererFactoryType } from '../linker/renderer';

export const PLATFORM_BROWSER_PROVIDER: Provider[] = [
  { provide: NodeWalker, deps: [] },
  { provide: RendererFactoryType, useValue: DomRendererFactory }
];
