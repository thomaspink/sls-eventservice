// tslint:disable:class-name
import {Type} from '../type';
import {ApplicationRef} from '../application';
import {Injector} from '../di/injector';
import {InjectionToken} from '../di/injection_token';
import {ComponentFactory, ComponentRef} from '../linker/component_factory';
import {ViewRef, InternalViewRef} from '../linker/view_ref';;
import {ElementRef} from '../linker/element_ref';
import {createRootView} from './view';
import {ViewData, ViewDefinitionFactory, asProviderData, asElementData, NodeDef} from './types';
import {resolveDefinition} from './util';

const EMPTY_CONTEXT = new Object();

export function createComponentFactory(
  selector: string, componentType: Type<any>, viewDefFactory: ViewDefinitionFactory,
  inputs: {[propName: string]: string} | null, outputs: {[propName: string]: string},
  ngContentSelectors: string[]): ComponentFactory<any> {
  return new ComponentFactory_(selector, componentType, viewDefFactory, inputs, outputs);
}

export function getComponentViewDefinitionFactory(componentFactory: ComponentFactory<any>):
  ViewDefinitionFactory {
  return (componentFactory as ComponentFactory_).viewDefFactory;
}

class ComponentFactory_ extends ComponentFactory<any> {
  /**
   * @internal
   */
  viewDefFactory: ViewDefinitionFactory;

  constructor(public selector: string, public componentType: Type<any>,
    viewDefFactory: ViewDefinitionFactory, private _inputs: {[propName: string]: string} | null,
    private _outputs: {[propName: string]: string}) {
    super();
    this.viewDefFactory = viewDefFactory;
  }

  get inputs() {
    const inputsArr: {propName: string, templateName: string}[] = [];
    const inputs = this._inputs!;
    for (let propName in inputs) {
      const templateName = inputs[propName];
      inputsArr.push({propName, templateName});
    }
    return inputsArr;
  }

  get outputs() {
    const outputsArr: {propName: string, templateName: string}[] = [];
    for (let propName in this._outputs) {
      const templateName = this._outputs[propName];
      outputsArr.push({propName, templateName});
    }
    return outputsArr;
  }

  create(injector: Injector, rootSelectorOrNode?: string | any): ComponentRef<any> {
    const viewDef = resolveDefinition(this.viewDefFactory);
    const componentNodeIndex = viewDef.nodes[0].element!.componentProvider!.index;

    const view = createRootView(null, viewDef, EMPTY_CONTEXT);
    const component = asProviderData(view, componentNodeIndex).instance;

    return new ComponentRef_(view, new ViewRef_(view), component);
  }
}

class ComponentRef_ extends ComponentRef<any> {
  public readonly hostView: ViewRef;
  public readonly instance: any;
  private _elDef: NodeDef;
  constructor(private _view: ViewData, private _viewRef: ViewRef, private _component: any) {
    super();
    this._elDef = this._view.def.nodes[0];
    this.hostView = _viewRef;
    this.instance = _component;
  }

  get location(): ElementRef {
    return new ElementRef(asElementData(this._view, this._elDef.index).renderElement);
  }
  get injector() {return new Injector_(this._view);};
  get componentType() {return <any>this._component.constructor;}

  /**
   * Destroys this component and removes it from the element
   */
  destroy(): void {this._viewRef.destroy();}
  onDestroy(callback: Function): void {this._viewRef.onDestroy(callback);}
}

class ViewRef_ extends ViewRef implements InternalViewRef {
  private _appRef: ApplicationRef|null;

  constructor(public view: ViewData) {
    super();
    this._appRef = null;
  }

  get renderer(): any {return null; /*this.view.renderer;*/};

  destroy(): void {
    // destroyView(this.view);
  }

  get destroyed() {
    // TODO change to state
    // return !!this.view.hostElement;
    return false;
  }

  onDestroy(callback: Function): any {
    // if (!this.view.disposables) {
    //   this.view.disposables = [];
    // }
    // this.view.disposables.push(<any>callback);
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
    // this.parent = _parent || view.injector || Injector.NULL;
  }

  get(token: any, notFoundValue?: any): any {
    // if (token === ELEMENT) {
    //   return this.view.hostElement;
    // }
    // if (token === ComponentRef) {
    //   return new ComponentRef_(this.view, new ViewRef_(this.view), this.view.component);
    // }
    // if (token === Renderer) {
    //   return this.view.renderer;
    // }
    // if (token === ComponentFactoryResolver) {
    //   return this.view.def.resolver || this.view.def.parent.resolver;
    // }
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
