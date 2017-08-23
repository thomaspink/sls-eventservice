import { ListWrapper } from '../util/collection';
import { Renderer, RendererFactory } from '../linker/renderer';
import { Visitor } from '../linker/visitor';
import { NodeWalker } from './node_walker';

export const NAMESPACE_URIS: { [ns: string]: string } = {
  'svg': 'http://www.w3.org/2000/svg',
  'xhtml': 'http://www.w3.org/1999/xhtml',
  'xlink': 'http://www.w3.org/1999/xlink',
  'xml': 'http://www.w3.org/XML/1998/namespace',
  'xmlns': 'http://www.w3.org/2000/xmlns/',
};

export class DefaultDomRenderer implements Renderer {
  data: { [key: string]: any } = Object.create(null);

  constructor() { }

  destroy(): void { }

  destroyNode: null;

  createElement(name: string, namespace?: string): any {
    if (namespace) {
      return document.createElementNS(NAMESPACE_URIS[namespace], name);
    }

    return document.createElement(name);
  }

  createComment(value: string): any { return document.createComment(value); }

  createText(value: string): any { return document.createTextNode(value); }

  appendChild(parent: any, newChild: any): void { parent.appendChild(newChild); }

  insertBefore(parent: any, newChild: any, refChild: any): void {
    if (parent) {
      parent.insertBefore(newChild, refChild);
    }
  }

  removeChild(parent: any, oldChild: any): void {
    if (parent) {
      parent.removeChild(oldChild);
    }
  }

  selectRootElement(selectorOrNode: string | any): any {
    let el: any = typeof selectorOrNode === 'string' ? document.querySelector(selectorOrNode) :
      selectorOrNode;
    if (!el) {
      throw new Error(`The selector "${selectorOrNode}" did not match any elements`);
    }
    return el;
  }

  parentNode(node: any): any { return node.parentNode; }

  nextSibling(node: any): any { return node.nextSibling; }

  setAttribute(el: any, name: string, value: string, namespace?: string): void {
    if (namespace) {
      name = `${namespace}:${name}`;
      const namespaceUri = NAMESPACE_URIS[namespace];
      if (namespaceUri) {
        el.setAttributeNS(namespaceUri, name, value);
      } else {
        el.setAttribute(name, value);
      }
    } else {
      el.setAttribute(name, value);
    }
  }

  removeAttribute(el: any, name: string, namespace?: string): void {
    if (namespace) {
      const namespaceUri = NAMESPACE_URIS[namespace];
      if (namespaceUri) {
        el.removeAttributeNS(namespaceUri, name);
      } else {
        el.removeAttribute(`${namespace}:${name}`);
      }
    } else {
      el.removeAttribute(name);
    }
  }

  addClass(el: any, name: string): void { el.classList.add(name); }

  removeClass(el: any, name: string): void { el.classList.remove(name); }

  setProperty(el: any, name: string, value: any): void {
    el[name] = value;
  }

  setValue(node: any, value: string): void { node.nodeValue = value; }

  listen(target: 'window' | 'document' | 'body' | any, event: string,
    callback: (event: any) => boolean | void): () => void {
    if (typeof target === 'string') {
      target = getGlobalEventTarget(target);
      if (!target) {
        throw new Error(`Unsupported event target ${target} for event ${event}`);
      }
    }
    callback = decoratePreventDefault(callback) as any;
    target.addEventListener(event, callback as any, false);
    return () => target.removeEventListener(event, callback as any, false);
  }

  parse() {
    throw new Error('Parse not available on the DefaultRenderer. Use ComponentRenderer instead.');
  }
}

export class ComponentDomRenderer extends DefaultDomRenderer {
  private _walker: NodeWalker;
  constructor(private _view: any, private _visitor: Visitor) {
    super();
    this._walker = new NodeWalker();
  }

  parse() {
    console.log(this._visitor);
    ListWrapper.forEach(this._view.hostElement.childNodes, node => {
      this._walker.traverse(node as any, this._visitor, this._view);
    });
  }
}

const defaultRenderer = new DefaultDomRenderer();

export class DomRendererFactory implements RendererFactory {
  private _rendererByView = new Map<any, Renderer>();

  constructor(private visitor?: Visitor) { };

  createRenderer(view: any): Renderer {
    let renderer = this._rendererByView.get(view);
    return renderer ||
      (this.visitor ? new ComponentDomRenderer(view, this.visitor) : defaultRenderer);
  }
}

function decoratePreventDefault(eventHandler: Function): Function {
  return (event: any) => {
    const allowDefaultBehavior = eventHandler(event);
    if (allowDefaultBehavior === false) {
      event.preventDefault();
      event.returnValue = false;
    }
  };
}

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

