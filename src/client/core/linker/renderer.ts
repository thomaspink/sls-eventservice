import { InjectionToken } from '../di/injection_token';

export abstract class Renderer {
  /**
   * This field can be used to store arbitrary data on this renderer instance.
   * This is useful for renderers that delegate to other renderers.
   */
  abstract get data(): { [key: string]: any };

  abstract destroy(): void;
  abstract createElement(name: string, namespace?: string | null): any;
  abstract createComment(value: string): any;
  abstract createText(value: string): any;
  /**
   * This property is allowed to be null / undefined,
   * in which case the view engine won't call it.
   * This is used as a performance optimization for production mode.
   */
  destroyNode: ((node: any) => void) | null;
  abstract appendChild(parent: any, newChild: any): void;
  abstract insertBefore(parent: any, newChild: any, refChild: any): void;
  abstract removeChild(parent: any, oldChild: any): void;
  abstract selectRootElement(selectorOrNode: string | any): any;
  /**
   * Attention: On WebWorkers, this will always return a value,
   * as we are asking for a result synchronously. I.e.
   * the caller can't rely on checking whether this is null or not.
   */
  abstract parentNode(node: any): any;
  /**
   * Attention: On WebWorkers, this will always return a value,
   * as we are asking for a result synchronously. I.e.
   * the caller can't rely on checking whether this is null or not.
   */
  abstract nextSibling(node: any): any;
  abstract setAttribute(el: any, name: string, value: string, namespace?: string | null): void;
  abstract removeAttribute(el: any, name: string, namespace?: string | null): void;
  abstract addClass(el: any, name: string): void;
  abstract removeClass(el: any, name: string): void;
  abstract setProperty(el: any, name: string, value: any): void;
  abstract setValue(node: any, value: string): void;
  abstract listen(
    target: 'window' | 'document' | 'body' | any, eventName: string,
    callback: (event: any) => boolean | void): () => void;

  abstract parse(view: any): void;
}

export abstract class RendererFactory {
  abstract createRenderer(): Renderer;
}

export interface RendererType {
  id: string;
  data: {[kind: string]: any};
}
