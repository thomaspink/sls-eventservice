import { Type } from '../type';
import { Provider } from '../di/provider';
import { Injector } from '../di/injector';
import { Renderer } from '../linker/renderer';
import { createInjector } from './refs';
import { ViewDefinition, ViewData, BindingFlags, DisposableFn } from './types';
import { callLifecycleHook } from '../lifecycle_hooks';
import { ComponentFactoryResolver } from '../linker/component_factory_resolver';

export function createComponentView(parent: ViewData, viewDef: ViewDefinition,
  hostElement?: any, injector?: Injector): ViewData {
  const renderer: Renderer = viewDef.rendererFactory.createRenderer();
  if (!hostElement) {
    hostElement = renderer.selectRootElement(viewDef.selector);
  }
  const providers = viewDef.providers.map(p => p.provider);
  if (viewDef.resolver) {
    providers.unshift({
      provide: ComponentFactoryResolver,
      useValue: viewDef.resolver
    });
  }
  const parentInjector = injector || (parent && parent.injector) || void 0;
  const inj = Injector.create(providers, parentInjector);
  return createView(hostElement, renderer, parent, viewDef, inj);
}

function createView(hostElement: any, renderer: Renderer | null, parent: ViewData | null,
  def: ViewDefinition, injector: Injector|null): ViewData {
  const disposables: DisposableFn[] = [];
  const view: ViewData = {
    def,
    renderer,
    parent,
    context: null,
    hostElement,
    component: null,
    injector,
    disposables,
    childViews: null
  };
  if (parent) {
    attachView(parent, view);
  }
  if (def.bindings)
    def.bindings.forEach(binding => {
      if (binding.isHost && binding.flags & BindingFlags.TypeEvent) {
        disposables.push(renderer.listen(hostElement, binding.name,
          (event) => def.handleEvent(view, binding.name, binding.index, event)));
      }
    });
  return view;
}

export function initView(view: ViewData, component: any, context: any) {
  view.component = component;
  view.context = context;
}

export function destroyView(view: ViewData) {
  if (view.disposables) {
    for (let i = 0; i < view.disposables.length; i++) {
      view.disposables[i]();
    }
  }
  callLifecycleHook(view.component, 'onDestroy');
  if (view.childViews) {
    view.childViews.forEach(v => destroyView(v));
  }
}

export function attachView(parentView: ViewData, view: ViewData) {
  if (!parentView.childViews) {
    parentView.childViews = [];
  } else if (parentView.childViews.indexOf(view) !== -1) {
    throw new Error(`This view is already attached`);
  }
  parentView.childViews.push(view);
}
