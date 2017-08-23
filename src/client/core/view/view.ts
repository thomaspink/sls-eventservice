import { Type } from '../type';
import { Provider } from '../di/provider';
import { Renderer } from '../linker/renderer';
import { createInjector } from './refs';
import { ViewDefinition, ViewData, BindingFlags } from './types';
import { callLifecycleHook } from '../lifecycle_hooks';

export function createComponentView(parent: ViewData, viewDef: ViewDefinition,
  hostElement?: any): ViewData {
  const renderer: Renderer = viewDef.rendererFactory.createRenderer();
  if (!hostElement) {
    hostElement = renderer.selectRootElement(viewDef.selector);
  }
  return createView(hostElement, renderer, parent, viewDef);
}

function createView(hostElement: any, renderer: Renderer | null, parent: ViewData | null,
  def: ViewDefinition): ViewData {
  console.log(hostElement, renderer);
  const disposables: Function[] = [];
  def.bindings.forEach(binding => {
    console.log(binding.flags, BindingFlags.TypeEvent);
    if (binding.flags & BindingFlags.TypeEvent) {
      disposables.push(renderer.listen(hostElement, binding.name, () => {
        console.log('adsf');
      }));
    }
  });
  const view: ViewData = {
    def,
    renderer,
    parent,
    context: null,
    hostElement,
    component: null,
    injector: null,
    disposables: null,
    childViews: null
  };
  view.injector = createInjector(view);
  attachView(parent, view);
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
  if (parentView.childViews.indexOf(view)) {
    throw new Error(`This view is already attached`);
  }
  if (!parentView.childViews) {
    parentView.childViews = [];
  }
  parentView.childViews.push(view);
}
