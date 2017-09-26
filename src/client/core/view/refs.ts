// tslint:disable:class-name
import {Type} from '../type';
import {ApplicationRef} from '../application';
import {Injector} from '../di/injector';
import {InjectionToken} from '../di/injection_token';
import {RendererFactory} from '../linker/renderer';
import {ComponentFactory, ComponentRef} from '../linker/component_factory';
import {ViewContainerRef} from '../linker/view_container_ref';
import {ViewRef, InternalViewRef} from '../linker/view_ref';
import {ElementRef} from '../linker/element_ref';
import {createRootView, createRootData, destroyView} from './view';
import {
  ViewData, ViewDefinitionFactory, asProviderData, ElementData, asElementData, NodeDef, NodeFlags,
  DepFlags, ViewContainerData, ViewState
} from './types';
import {resolveDefinition, tokenKey, viewParentEl, rootRenderNodes} from './util';
import {resolveDep} from './provider';
import {attachEmbeddedView, detachEmbeddedView, moveEmbeddedView, renderDetachView} from './view_attach';

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
    const elementNode = viewDef.nodes[0];
    const componentNodeIndex = elementNode.element!.componentProvider!.index;

    // TODO @thomaspink: Maybe change this in a later stage
    const rendererFactory: RendererFactory = injector.get(<any>RendererFactory);
    const rootData = createRootData(injector, rendererFactory, rootSelectorOrNode);

    const hostView = createRootView(rootData, viewDef, EMPTY_CONTEXT);
    const component = asProviderData(hostView, componentNodeIndex).instance;
    // const componentView = asElementData(hostView, elementNode.index).componentView;

    // .renderer.parse();

    return new ComponentRef_(hostView, new ViewRef_(hostView), component);
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
  get injector(): Injector {return new Injector_(this._view, this._elDef);}
  get componentType() {return <any>this._component.constructor;}

  /**
   * Destroys this component and removes it from the element
   */
  destroy(): void {this._viewRef.destroy();}
  onDestroy(callback: Function): void {this._viewRef.onDestroy(callback);}
}

export function createViewContainerData(
  view: ViewData, elDef: NodeDef, elData: ElementData): ViewContainerData {
  return new ViewContainerRef_(view, elDef, elData);
}

class ViewContainerRef_ implements ViewContainerData {
  /**
   * @internal
   */
  _embeddedViews: ViewData[] = [];
  constructor(private _view: ViewData, private _elDef: NodeDef, private _data: ElementData) {}

  get element(): ElementRef {return new ElementRef(this._data.renderElement);}

  get injector(): Injector {return new Injector_(this._view, this._elDef);}

  get parentInjector(): Injector {
    let view = this._view;
    let elDef = this._elDef.parent;
    while (!elDef && view) {
      elDef = viewParentEl(view);
      view = view.parent!;
    }

    return view ? new Injector_(view, elDef) : new Injector_(this._view, null);
  }

  clear(): void {
    const len = this._embeddedViews.length;
    for (let i = len - 1; i >= 0; i--) {
      const view = detachEmbeddedView(this._data, i)!;
      destroyView(view);
    }
  }

  get(index: number): ViewRef | null {
    const view = this._embeddedViews[index];
    if (view) {
      const ref = new ViewRef_(view);
      // ref.attachToViewContainerRef(this);
      return ref;
    }
    return null;
  }

  get length(): number {return this._embeddedViews.length;};

  // createEmbeddedView<C>(templateRef: TemplateRef<C>, context?: C, index?: number):
  //     EmbeddedViewRef<C> {
  //   const viewRef = templateRef.createEmbeddedView(context || <any>{});
  //   this.insert(viewRef, index);
  //   return viewRef;
  // }

  createComponent<C>(componentFactory: ComponentFactory<C>, index?: number,
    injector?: Injector): ComponentRef<C> {
    const contextInjector = injector || this.parentInjector;
    const componentRef =
      componentFactory.create(contextInjector, undefined);
    this.insert(componentRef.hostView, index);
    return componentRef;
  }

  insert(viewRef: ViewRef, index?: number): ViewRef {
    if (viewRef.destroyed) {
      throw new Error('Cannot insert a destroyed View in a ViewContainer!');
    }
    const viewRef_ = <ViewRef_>viewRef;
    const viewData = viewRef_._view;
    attachEmbeddedView(this._view, this._data, index, viewData);
    // viewRef_.attachToViewContainerRef(this);
    return viewRef;
  }

  move(viewRef: ViewRef_, currentIndex: number): ViewRef {
    if (viewRef.destroyed) {
      throw new Error('Cannot move a destroyed View in a ViewContainer!');
    }
    const previousIndex = this._embeddedViews.indexOf(viewRef._view);
    moveEmbeddedView(this._data, previousIndex, currentIndex);
    return viewRef;
  }

  indexOf(viewRef: ViewRef): number {
    return this._embeddedViews.indexOf((<ViewRef_>viewRef)._view);
  }

  remove(index?: number): void {
    const viewData = detachEmbeddedView(this._data, index);
    if (viewData) {
      destroyView(viewData);
    }
  }

  detach(index?: number): ViewRef | null {
    const view = detachEmbeddedView(this._data, index);
    return view ? new ViewRef_(view) : null;
  }
}


class ViewRef_ implements InternalViewRef {
  /** @internal */
  _view: ViewData;
  private _viewContainerRef: ViewContainerRef | null;
  private _appRef: ApplicationRef | null;

  constructor(_view: ViewData) {
    this._view = _view;
    this._viewContainerRef = null;
    this._appRef = null;
  }

  get rootNodes(): any[] {return rootRenderNodes(this._view);}

  get context() {return this._view.context;}

  get destroyed(): boolean {return (this._view.state & ViewState.Destroyed) !== 0;}

  // markForCheck(): void { markParentViewsForCheck(this._view); }
  detach(): void { this._view.state &= ~ViewState.Attached; }
  // detectChanges(): void {
  //   const fs = this._view.root.rendererFactory;
  //   if (fs.begin) {
  //     fs.begin();
  //   }
  //   Services.checkAndUpdateView(this._view);
  //   if (fs.end) {
  //     fs.end();
  //   }
  // }
  // checkNoChanges(): void { Services.checkNoChangesView(this._view); }

  reattach(): void { this._view.state |= ViewState.Attached; }
  onDestroy(callback: Function) {
    if (!this._view.disposables) {
      this._view.disposables = [];
    }
    this._view.disposables.push(<any>callback);
  }

  destroy() {
    if (this._appRef) {
      this._appRef.detachView(this);
    } else if (this._viewContainerRef) {
      this._viewContainerRef.detach(this._viewContainerRef.indexOf(this));
    }
    destroyView(this._view);
  }

  detachFromAppRef() {
    this._appRef = null;
    renderDetachView(this._view);
    // Services.dirtyParentQueries(this._view);
  }

  attachToAppRef(appRef: ApplicationRef) {
    if (this._viewContainerRef) {
      throw new Error('This view is already attached to a ViewContainer!');
    }
    this._appRef = appRef;
  }

  attachToViewContainerRef(vcRef: ViewContainerRef) {
    if (this._appRef) {
      throw new Error('This view is already attached directly to the ApplicationRef!');
    }
    this._viewContainerRef = vcRef;
  }

}

export function createInjector(view: ViewData, elDef: NodeDef): Injector {
  return new Injector_(view, elDef);
}

class Injector_ implements Injector {
  constructor(private view: ViewData, private elDef: NodeDef | null) {}
  get(token: any, notFoundValue: any = Injector.THROW_IF_NOT_FOUND): any {
    const allowPrivateServices =
      this.elDef ? (this.elDef.flags & NodeFlags.ComponentView) !== 0 : false;
    return resolveDep(
      this.view, this.elDef, allowPrivateServices,
      {flags: DepFlags.None, token, tokenKey: tokenKey(token)}, notFoundValue);
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
