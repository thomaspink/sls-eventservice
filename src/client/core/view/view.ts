import { Type } from '../type';
import { Provider } from '../di/provider';
import { Renderer } from '../linker/renderer';
import { createInjector } from './refs';
import { ViewDefinition, ViewData } from './types';

export function createComponentView(parent: ViewData, viewDef: ViewDefinition,
  hostElement?: any): ViewData {
  const view = createView(hostElement, null, parent, viewDef);
  let compRenderer: Renderer = viewDef.rendererFactory.createRenderer(view);
  view.renderer = compRenderer;
  if (!hostElement) {
    view.hostElement = compRenderer.selectRootElement(viewDef.selector);
  }
  return view;
}

function createView(hostElement: any, renderer: Renderer | null, parent: ViewData | null,
  def: ViewDefinition): ViewData {
  const view: ViewData = {
    def,
    renderer,
    parent,
    context: null,
    hostElement,
    component: null,
    injector: null,
    disposables: null
  };
  view.injector = createInjector(view);
  return view;
}

export function initView(view: ViewData, component: any, context: any) {
  view.component = component;
  view.context = context;
}
