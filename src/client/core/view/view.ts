import { Injector } from '../di/injector';
import { Provider } from '../di/provider';
import { ViewRef } from '../linker/view_ref';
import { RootRenderer } from '../linker/renderer';
import { createRootRenderer, createViewRenderer } from './renderer';
import { createViewRef, createComponentFactory, ELEMENT } from './refs';

export function createView(elementOrSelector: Element | string,
  rootRenderer: RootRenderer): ViewRef {

  let element: Element;
  if (typeof elementOrSelector === 'string') {
    element = rootRenderer.findElement(elementOrSelector);
  } else {
    element = elementOrSelector;
  }
  const renderer = createViewRenderer(rootRenderer, element);
  const view = createViewRef(element, renderer);
  return view;
}

export function destroyView(view: ViewRef) {
  // TODO
}

export { createComponentFactory, ELEMENT };

export const VIEW_PROVIDERS: Provider[] = [
  { provide: RootRenderer, useFactory: createRootRenderer, deps: [] }
];
