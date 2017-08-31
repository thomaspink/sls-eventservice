// tslint:disable:class-name
import { Type } from '../type';
import { stringify } from '../util';
import { ApplicationRef } from '../application';
import { Injector } from '../di/injector';
import { Provider, ClassProvider } from '../di/provider';
import { InjectionToken } from '../di/injection_token';
import { ComponentFactory, ComponentRef } from '../linker/component_factory';
import { ComponentFactoryResolver } from '../linker/component_factory_resolver';
import { ViewRef, InternalViewRef } from '../linker/view_ref';
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
    const view = createComponentView(parentView, this.viewDef, element, parentInjector);
    const instance = createClass(this.componentType, new Injector_(view), view.def.deps);
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
  get injector() { return new Injector_(this._view); };
  get hostView() { return this._viewRef; };
  get componentType() { return <any>this._component.constructor; }

  /**
   * Destroys this component and removes it from the element
   */
  destroy(): void { this._viewRef.destroy(); }
  onDestroy(callback: Function): void { this._viewRef.onDestroy(callback); }
}

class ViewRef_ extends ViewRef implements InternalViewRef {
  private _appRef: ApplicationRef|null;

  constructor(public view: ViewData) {
    super();
    this._appRef = null;
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

  detachFromAppRef() {
    this._appRef = null;
  }

  attachToAppRef(appRef: ApplicationRef) {
    this._appRef = appRef;
  }

}

export function createInjector(view: ViewData, parent?: Injector): Injector {
  return new Injector_(view);
}
class Injector_ extends Injector {
  private parent: Injector;
  constructor(private view: ViewData, _parent?: Injector) {
    super();
    this.parent = _parent || view.injector || Injector.NULL;
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
    return this.parent.get(token, notFoundValue);
  }
}

/**
 * Dependency token for injecting the native element of a component.
 *
 * Example:
 * ```typescript
 * @Component({
 *   selector: 'body',
 *   deps: [ELEMENT]
 * })
 * export class FooComponent {
 *   constructor(element: Element) { }
 * }
 * ```
 */
export const ELEMENT = new InjectionToken('ComponentElement');
