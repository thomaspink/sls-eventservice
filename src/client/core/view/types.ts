// tslint:disable:no-bitwise
import { Type } from '../type';
import { Provider } from '../di/provider';
import { Injector } from '../di/injector';
import { ComponentFactory } from '../linker/component_factory';
import { ComponentFactoryResolver } from '../linker/component_factory_resolver';
import { Renderer, RendererFactory } from '../linker/renderer';

export interface DisposableFn { (): void; }

export interface HandleEventFn { (view: ViewData, eventName: string, event: any): boolean; }

export interface ViewDefinition {
  selector: string;
  componentType: Type<any>;
  parent: ViewDefinition|null;
  factory: ComponentFactory<any>;
  resolver: ComponentFactoryResolver|null;
  rendererFactory: RendererFactory|null;
  providers: Provider[]|null;
  deps: any[]|null;
  childComponents: Type<any>[]|null;
  childDefs: ViewDefinition[]|null;
  hostBindings: BindingDef[];
  hostBindingFlags: BindingFlags;
  bindings: BindingDef[];
  bindingFlags: BindingFlags;
  handleEvent: HandleEventFn|null;
  queries: QueryDef[]|null;
}

export interface BindingDef {
  flags: BindingFlags;
  ns: string|null;
  name: string|null;
  suffix: string|null;
}

export const enum BindingFlags {
  TypeElementAttribute = 1 << 0,
  TypeElementClass = 1 << 1,
  TypeElementStyle = 1 << 2,
  TypeProperty = 1 << 3,
  TypeEvent = 1 << 4,
}

export interface QueryDef {
  selector: any;
  bindings: QueryBindingDef[];
}
export interface QueryBindingDef {
  propName: string;
  bindingType: QueryBindingType;
  valueType: QueryValueType;
}
export const enum QueryBindingType {First = 0, All = 1}
export const enum QueryValueType {
  Element = 0,
  Component = 1
}

export interface ViewData {
  def: ViewDefinition;
  // root: RootData;
  renderer: Renderer;
  parent: ViewData|null;
  hostElement: any;
  component: any;
  context: any;
  injector: Injector;
  disposables: DisposableFn[]|null;
  childViews: ViewData[]|null;
}
