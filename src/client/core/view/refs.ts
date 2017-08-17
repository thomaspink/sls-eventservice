import { Type } from '../type';
import { stringify } from '../util';
import { Injector, StaticInjector } from '../di/injector';
import { Provider } from '../di/provider';
import { InjectionToken } from '../di/injection_token';
import { ComponentFactory, ComponentRef } from '../linker/component_factory';
import { ViewRef } from '../linker/view_ref';
import { Renderer, RootRenderer } from '../linker/renderer';
import { callLifecycleHook } from '../lifecycle_hooks';
import { createView } from './view';

export function createComponentFactory(selector: string, componentType: Type<any>,
  providers: Provider[], deps: any[]) {
  return new ComponentFactory_(selector, componentType, providers, deps);
}
class ComponentFactory_ extends ComponentFactory<any> {
  constructor(public selector: string, public componentType: Type<any>,
    private providers: Provider[], private deps: any[]) {
    super();
  }

  create(elementOrSelector: any, parent?: ComponentRef<any>, injector?: Injector) {

    const parentInjector = injector || (parent && parent.injector);
    if (!parentInjector) {
      throw new Error(`No injector or parent component provided for creating ` +
        `the component ${stringify(this.componentType)}`);
    }
    const rootRenderer = parentInjector.get(RootRenderer as Type<RootRenderer>);
    const view = createView(elementOrSelector, rootRenderer);
    const viewInjector = createInjector(view, this.providers, injector);

    const tokens = this.deps;
    let deps: any[] = [];
    if (tokens && tokens.length) {
      deps = tokens.map(dep => viewInjector.get(dep));
    }

    const instance = new this.componentType(...deps);
    const ref = new ComponentRef_(view, instance, viewInjector);
    callLifecycleHook(instance, 'onInit');
    return ref;
  }
}

class ComponentRef_ extends ComponentRef<any> {
  constructor(private _viewRef: ViewRef, private _component: any, private _injector: Injector) {
    super();
  }

  get location() { return this._viewRef.element; };
  get instance() { return this._component; };
  get injector() { return this._injector; };
  get hostView() { return this._viewRef; };
  get componentType() { return <any>this._component.constructor; }

  /**
   * Destroys this component and removes it from the element
   */
  // destroy(): void { destroyComponent(this); }
}

export function createViewRef(element: Element, renderer: Renderer) {
  return new ViewRef_(element, renderer);
}
class ViewRef_ extends ViewRef {
  constructor(private _element: Element, private _renderer: Renderer) {
    super();
  }

  get element(): Element { return this._element; }
  get renderer(): Renderer { return this._renderer; }

  destroy(): void {
    // TODO
  }

  get destroyed() {
    // TODO
    return false;
  }

  onDestroy(callback: Function): any {
    // TODO
  }
}


export function createInjector(view: ViewRef, providers?: Provider[],
  parent?: Injector): Injector {
  return new Injector_(view, providers, parent);
}
class Injector_ extends StaticInjector {
  constructor(private view: ViewRef, providers?: Provider[], parent?: Injector) {
    super(providers, parent);
  }

  get(token: any, notFoundValue?: any): any {
    if (token === ELEMENT) {
      return this.view.element;
    }
    if (token === Renderer) {
      return this.view.renderer;
    }
    return super.get(token, notFoundValue);
  }
}
export const ELEMENT = new InjectionToken('ComponentElement');
