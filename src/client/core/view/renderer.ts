import { Renderer, RootRenderer } from '../linker/renderer';

export const NAMESPACE_URIS: { [ns: string]: string } = {
  'xlink': 'http://www.w3.org/1999/xlink',
  'svg': 'http://www.w3.org/2000/svg',
  'xhtml': 'http://www.w3.org/1999/xhtml',
  'xml': 'http://www.w3.org/XML/1998/namespace'
};

function getGlobalEventTarget(target: string): any {
  if (target === 'window') {
    return window;
  }
  if (target === 'document') {
    return this.document;
  }
  if (target === 'body') {
    return this.document.body;
  }
  return undefined;
}

class RootRenderer_ {
  findElements(selector: string, root: Document | Element = document): Element[] {
    return [].slice.call(root.querySelectorAll(selector));
  }

  findElement(selector: string, root: Document | Element = document): Element | null {
    return root.querySelector(selector);
  }
}

class Renderer_ extends Renderer {
  constructor(private rootRenderer: RootRenderer, private element: Element) {
    super();
  }

  findElements(selector: string): Element[] {
    return this.rootRenderer.findElements(selector, this.element);
  }

  findElement(selector: string): Element | null {
    return this.rootRenderer.findElement(selector, this.element);
  }

  listen(target: 'window' | 'document' | 'body' | any, event: string,
    callback: (event: any) => boolean | void): () => void {
    if (typeof target === 'string') {
      target = getGlobalEventTarget(target);
      if (!target) {
        throw new Error(`Unsupported event target ${target} for event ${event}`);
      }
    }
    target.addEventListener(event, callback as any, false);
    return () => target.removeEventListener(event, callback as any, false);
  }
}

export function createRootRenderer(): RootRenderer {
  return new RootRenderer_();
}

export function createViewRenderer(rootRenderer: RootRenderer, element: Element): Renderer {
  return new Renderer_(rootRenderer, element);
}
