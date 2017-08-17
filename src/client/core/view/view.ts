import { Type } from '../type';
import { Provider } from '../di/provider';
import { Renderer } from '../linker/renderer';
import { createInjector } from './refs';
import { ViewDefinition, ViewData } from './types';

import { DomRenderer } from '../platform-browser/dom_renderer';

export function createComponentView(parentView: ViewData, viewDef: ViewDefinition,
  hostElement?: any): ViewData {
  // TODO: Rework so we don't have a platform dependency
  let compRenderer: Renderer = new DomRenderer();
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
