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
  const disposables: Function[] = [];
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
  if (parent) {
    attachView(parent, view);
  }
  def.bindings.forEach(binding => {
    if (binding.flags & BindingFlags.TypeEvent) {
      disposables.push(renderer.listen(hostElement, binding.name,
        (event) => def.handleEvent(view, binding.name, event)));
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
