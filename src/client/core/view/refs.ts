// tslint:disable:class-name
import { Type } from '../type';
import { stringify } from '../util';
import { Injector, StaticInjector } from '../di/injector';
import { Provider } from '../di/provider';
import { InjectionToken } from '../di/injection_token';
import { ComponentFactory, ComponentRef } from '../linker/component_factory';
import { ComponentFactoryResolver } from '../linker/component_factory_resolver';
import { ViewRef } from '../linker/view_ref';
import { Renderer } from '../linker/renderer';
import { callLifecycleHook } from '../lifecycle_hooks';
import { createComponentView, initView, destroyView } from './view';
import { ViewDefinition, ViewData } from './types';
import { createClass } from './util';

export function createComponentFactory(selector: string, componentType: Type<any>,
  viewDef: ViewDefinition) {
  return new ComponentFactory_(selector, componentType, viewDef);
}
class ComponentFactory_ extends ComponentFactory<any> {
  constructor(public selector: string, public componentType: Type<any>,
    private viewDef: ViewDefinition) {
    super();
  }

  create(element?: any|null, injector?: Injector|null, parent?: ComponentRef<any>|null) {
    const parentInjector = injector || (parent && parent.injector);
    if (!parentInjector) {
      throw new Error(`No injector or parent component provided for creating ` +
        `the component ${stringify(this.componentType)}`);
    }
    const parentView = parent ? (parent.hostView as ViewRef_).view : null;
    const view = createComponentView(parentView, this.viewDef, element);
    const instance = createClass(this.componentType, view.injector, view.def.deps);
    initView(view, instance, null);
    view.renderer.parse(view);
    callLifecycleHook(instance, 'onInit');
    return new ComponentRef_(view, new ViewRef_(view), instance);
  }
}

class ComponentRef_ extends ComponentRef<any> {
  constructor(private _view: ViewData, private _viewRef: ViewRef, private _component: any) {
    super();
  }

  get location() { return this._view.hostElement; };
  get instance() { return this._view.component; };
  get injector() { return this._view.injector; };
  get hostView() { return this._viewRef; };
  get componentType() { return <any>this._component.constructor; }

  /**
   * Destroys this component and removes it from the element
   */
  destroy(): void { this._viewRef.destroy(); }
  onDestroy(callback: Function): void { this._viewRef.onDestroy(callback); }
}

class ViewRef_ extends ViewRef {
  constructor(public view: ViewData) {
    super();
  }

  get renderer() { return this.view.renderer; };

  destroy(): void {
    destroyView(this.view);
  }

  get destroyed() {
    // TODO
    return false;
  }

  onDestroy(callback: Function): any {
    if (!this.view.disposables) {
      this.view.disposables = [];
    }
    this.view.disposables.push(<any>callback);
  }
}

export function createInjector(view: ViewData): Injector {
  return new Injector_(view);
}
class Injector_ extends StaticInjector {
  constructor(private view: ViewData, parent?: Injector) {
    super(view.def.providers, parent || (view.parent && view.parent.injector));
  }

  get(token: any, notFoundValue?: any): any {
    if (token === ELEMENT) {
      return this.view.hostElement;
    }
    if (token === Renderer) {
      return this.view.renderer;
    }
    if (token === ComponentFactoryResolver) {
      return this.view.def.resolver || this.view.def.parent.resolver;
    }
    return super.get(token);
  }
}
export const ELEMENT = new InjectionToken('ComponentElement');
