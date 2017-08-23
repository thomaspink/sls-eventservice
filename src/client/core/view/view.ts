import { Type } from '../type';
import { Provider } from '../di/provider';
import { Renderer } from '../linker/renderer';
import { createInjector } from './refs';
import { ViewDefinition, ViewData } from './types';

export function createComponentView(parentView: ViewData, viewDef: ViewDefinition,
  hostElement?: any): ViewData {
  let compRenderer: Renderer = viewDef.rendererFactory.createRenderer(hostElement);
  if (!hostElement) {
    hostElement = compRenderer.selectRootElement(viewDef.selector);
  }
  return createView(hostElement, compRenderer, null, viewDef);
}

function createView(hostElement: any, renderer: Renderer, parent: ViewData | null,
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
