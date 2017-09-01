// tslint:disable:no-bitwise
import { Type } from '../type';
import { ClassProvider, ConstructorProvider, ExistingProvider, FactoryProvider, ValueProvider } from '../di/provider';
import { Injector } from '../di/injector';
import { ComponentFactory } from '../linker/component_factory';
import { ComponentFactoryResolver } from '../linker/component_factory_resolver';
import { Renderer, RendererFactory } from '../linker/renderer';

export interface Node {
  index: number;
  type: NodeTypes;
}

export const enum NodeTypes {
  ViewDefinition = 1 << 0,
  Provider = 1 << 1,
  Binding = 1 << 2,
  Query = 1 << 3,
  Output = 1 << 4
}

/**
 * ViewDefinition
 */
export interface ViewDefinition extends Node {
  selector: string;
  componentType: Type<any>;
  parent: ViewDefinition | null;
  factory: ComponentFactory<any>;
  resolver: ComponentFactoryResolver | null;
  rendererFactory: RendererFactory | null;
  providers: Provider[] | null;
  deps: any[] | null;
  childComponents: Provider[] | null;
  childDefs: ViewDefinition[] | null;
  bindings: BindingDef[];
  bindingFlags: BindingFlags;
  outputs: OutputDef[];
  queries: QueryDef[] | null;
  handleEvent: HandleEventFn | null;
  element: ElementDef | null;
  template: string | null;
}
export function isViewDefinition(node: Node) { return !!(node.type & NodeTypes.ViewDefinition); }
export interface HandleEventFn {
  (view: ViewData, eventName: string, bindingIndex: number, event: any): boolean;
}

/**
 * Provider
 */
export interface Provider extends Node {
  provider: ClassProvider | ConstructorProvider | ExistingProvider | FactoryProvider | ValueProvider;
}
export function isProvider(node: Node) { return !!(node.type & NodeTypes.Provider); }

export interface OutputDef extends Node {
  target: 'window' | 'document' | 'body' | 'component' | null;
  eventName: string;
  propName: string | null;
}

export interface ElementDef {
  name: string | null;
  ns: string | null;
  /** ns, name, value */
  attrs: [string, string, string][] | null;
}


/**
 * Bindings
 */
export interface BindingDef extends Node {
  flags: BindingFlags;
  ns: string | null;
  name: string | null;
  suffix: string | null;
  isHost: boolean;
}
export const enum BindingFlags {
  TypeElementAttribute = 1 << 0,
  TypeElementClass = 1 << 1,
  TypeElementStyle = 1 << 2,
  TypeProperty = 1 << 3,
  TypeEvent = 1 << 4,
}
export function isBinding(node: Node) { return !!(node.type & NodeTypes.Binding); }

/**
 * Queries
 */
export interface QueryDef extends Node {
  queryBindings: QueryBindingDef[];
}
export interface QueryBindingDef {
  propName: string;
  bindingType: QueryBindingType;
  valueType: QueryValueType;
}
export const enum QueryBindingType { First = 0, All = 1 }
export const enum QueryValueType {
  Element = 0,
  Component = 1
}
export function isQuery(node: Node) { return !!(node.type & NodeTypes.Query); }

/**
 * ViewData
 */
export interface ViewData {
  def: ViewDefinition;
  // root: RootData;
  renderer: Renderer;
  parent: ViewData | null;
  hostElement: any;
  component: any;
  context: any;
  injector: Injector;
  disposables: DisposableFn[] | null;
  childViews: ViewData[] | null;
}
export interface DisposableFn { (): void; }
