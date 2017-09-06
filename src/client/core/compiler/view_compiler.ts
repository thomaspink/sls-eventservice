import { Type, isType } from '../type';
import { Provider, ValueProvider, ExistingProvider, FactoryProvider, ClassProvider, ConstructorProvider } from '../di/provider';
import { splitAtColon } from './util';
import { ListWrapper } from '../util/collection';
import { NodeDef, NodeFlags, DepFlags, OutputDef, OutputType } from '../view/types';
import { componentDef, providerDef } from '../view/provider';
import { elementDef } from '../view/element';
import { viewDef } from '../view/view';
import { ComponentResolver } from './component_resolver';
import { CssSelector } from './selector';

type RawProvider = ValueProvider | ExistingProvider | FactoryProvider | ClassProvider | ConstructorProvider;
type DepProvider = FactoryProvider | ClassProvider | ConstructorProvider;

export class ViewCompiler {
  constructor(private _resolver: ComponentResolver) {
  }

  compileComponent(component: Type<any>) {
    const metadata = this._resolver.resolve(component);
    const nodes: NodeDef[] = [];

    const compDeps = (metadata.deps && metadata.deps.map(dep => [DepFlags.None, dep])) || [];
    const compDef = componentDef(0, [], 0, component, compDeps);
    nodes.push(compDef);

    const element = this._visitElement(metadata.selector);
    nodes.push(element);

    if (metadata.providers && metadata.providers.length) {
      const providers = this._visitProviders(metadata.providers, nodes);
      nodes.push(...providers);
    }

    return viewDef(nodes);

  }

  private _visitElement(selector?: string) {
    const attrs: [string, string, string][] = [];
    let name = '';
    if (selector) {
      const parsedSelector = CssSelector.parse(selector)[0];
      if (parsedSelector.classNames.length) {
        attrs.push(['', 'class', parsedSelector.classNames.join(', ')]);
      }
      if (parsedSelector.attrs.length) {
        for (let i = 0; i < parsedSelector.attrs.length; i += 2) {
          attrs.push(['', parsedSelector.attrs[i], parsedSelector.attrs[i + 1]]);
        }
      }
      name = parsedSelector.element || '';
    }
    return elementDef(0, [], 0, name, attrs, [], []);
  }

  private _visitProviders(providers: Provider[], nodes: NodeDef[]) {
    return ListWrapper.flatten(providers).map((provider: RawProvider) => {
      let flags = NodeFlags.None;
      let token = provider.provide;
      let value: any;
      let deps: ([DepFlags, any] | any)[] = [];
      if ((provider as ValueProvider).useValue !== void 0) {
        flags |= NodeFlags.TypeValueProvider;
      } else if ((provider as ExistingProvider).useExisting !== void 0) {
        flags |= NodeFlags.TypeUseExistingProvider;
      } else if ((provider as FactoryProvider).useFactory !== void 0) {
        flags |= NodeFlags.TypeFactoryProvider;
      } else {
        flags |= NodeFlags.TypeClassProvider;
        if ((provider as ClassProvider).useClass !== void 0) {
          value = (provider as ClassProvider).useClass;
        } else if (isType(token)) {
          value = token;
        } else {
          throw new Error(`Unknown Provider Type`);
        }
        flags |= NodeFlags.TypeClassProvider;
      }
      if ((provider as DepProvider).deps) {
        deps = (provider as DepProvider).deps.map(dep => [DepFlags.None, dep]);
      }
      return providerDef(flags, [], token, value, deps);
    });
  }
}

export function calcNodeFlags(nodes: NodeDef[]): NodeFlags {
  let flags = 0;
  for (let i = 0; i < nodes.length; i++) {
    flags |= nodes[i].flags;
  }
  return flags;
}

export const VIEW_COMPILER_PROVIDER: Provider = {
  provide: ViewCompiler,
  deps: [ComponentResolver]
}
