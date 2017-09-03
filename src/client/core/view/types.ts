// tslint:disable:no-bitwise
import { Type } from '../type';
import { ClassProvider, ConstructorProvider, ExistingProvider, FactoryProvider, ValueProvider } from '../di/provider';
import { Injector } from '../di/injector';
import { ComponentFactory } from '../linker/component_factory';
import { ComponentFactoryResolver } from '../linker/component_factory_resolver';
import { Renderer, RendererFactory } from '../linker/renderer';

export interface DefinitionFactory<D extends Definition<any>> { (): D; }

export interface Definition<DF extends DefinitionFactory<any>> { factory: DF|null; }

export interface Node {
  index: number;
  type: NodeTypes;
}

/**
 * A node definition in the view.
 *
 * Note: We use one type for all nodes so that loops that loop over all nodes
 * of a ViewDefinition stay monomorphic!
 */
export interface NodeDef {
  flags: NodeFlags;
  index: number;
  parent: NodeDef|null;
  // renderParent: NodeDef|null;
  /** this is checked against NgContentDef.index to find matched nodes */
  // ngContentIndex: number;
  /** number of transitive children */
  // childCount: number;
  /** aggregated NodeFlags for all transitive children (does not include self) **/
  // childFlags: NodeFlags;
  /** aggregated NodeFlags for all direct children (does not include self) **/
  // directChildFlags: NodeFlags;

  bindingIndex: number;
  bindings: BindingDef[];
  bindingFlags: BindingFlags;
  outputIndex: number;
  outputs: OutputDef[];
  /**
   * references that the user placed on the element
   */
  // references: {[refId: string]: QueryValueType};
  /**
   * ids and value types of all queries that are matched by this node.
   */
  // matchedQueries: {[queryId: number]: QueryValueType};
  /** Binary or of all matched query ids of this node. */
  // matchedQueryIds: number;
  /**
   * Binary or of all query ids that are matched by one of the children.
   * This includes query ids from templates as well.
   * Used as a bloom filter.
   */
  // childMatchedQueries: number;
  element: ElementDef|null;
  provider: ProviderDef|null;
  // text: TextDef|null;
  // query: QueryDef|null;
  // ngContent: NgContentDef|null;
}

/**
 * Bitmask for NodeDef.flags.
 * Naming convention:
 * - `Type...`: flags that are mutually exclusive
 * - `Cat...`: union of multiple `Type...` (short for category).
 */
export const enum NodeFlags {
  None = 0,
  TypeElement = 1 << 0,
  TypeText = 1 << 1,
  ProjectedTemplate = 1 << 2,
  CatRenderNode = TypeElement | TypeText,
  // TypeNgContent = 1 << 3,
  // TypePipe = 1 << 4,
  // TypePureArray = 1 << 5,
  // TypePureObject = 1 << 6,
  // TypePurePipe = 1 << 7,
  // CatPureExpression = TypePureArray | TypePureObject | TypePurePipe,
  TypeValueProvider = 1 << 8,
  TypeClassProvider = 1 << 9,
  TypeFactoryProvider = 1 << 10,
  TypeUseExistingProvider = 1 << 11,
  LazyProvider = 1 << 12,
  PrivateProvider = 1 << 13,
  TypeComponent = 1 << 14,
  Component = 1 << 15,
  CatProviderNoDirective =
      TypeValueProvider | TypeClassProvider | TypeFactoryProvider | TypeUseExistingProvider,
  CatProvider = CatProviderNoDirective | TypeComponent,
  OnInit = 1 << 16,
  OnDestroy = 1 << 17,
  // DoCheck = 1 << 18,
  // OnChanges = 1 << 19,
  // AfterContentInit = 1 << 20,
  // AfterContentChecked = 1 << 21,
  // AfterViewInit = 1 << 22,
  // AfterViewChecked = 1 << 23,
  // EmbeddedViews = 1 << 24,
  // ComponentView = 1 << 25,
  // TypeContentQuery = 1 << 26,
  TypeViewQuery = 1 << 27,
  // StaticQuery = 1 << 28,
  // DynamicQuery = 1 << 29,
  CatQuery = /*TypeContentQuery | */TypeViewQuery,

  // mutually exclusive values...
  Types = CatRenderNode | /*TypeNgContent | *//*TypePipe | *//*CatPureExpression | */CatProvider | CatQuery;
}

export const enum NodeTypes {
  ViewDefinition,
  Element,
  Provider,
  Binding,
  Query,
  Output
}

/**
 * ViewDefinition
 */
export interface ViewDefinitionFactory extends DefinitionFactory<ViewDefinition> {}

export interface ViewDefinition extends Definition<ViewDefinitionFactory> {
  // flags: ViewFlags;
  // updateDirectives: ViewUpdateFn;
  // updateRenderer: ViewUpdateFn;
  handleEvent: ViewHandleEventFn;
  /**
   * Order: Depth first.
   * Especially providers are before elements / anchors.
   */
  nodes: NodeDef[];
  /** aggregated NodeFlags for all nodes **/
  nodeFlags: NodeFlags;
  rootNodeFlags: NodeFlags;
  lastRenderRootNode: NodeDef|null;
  bindingCount: number;
  outputCount: number;
  /**
   * Binary or of all query ids that are matched by one of the nodes.
   * This includes query ids from templates as well.
   * Used as a bloom filter.
   */
  nodeMatchedQueries: number;
}

export interface ViewHandleEventFn {
  (view: ViewData, nodeIndex: number, eventName: string, event: any): boolean;
}

export interface ViewDefinitionOld extends Node {
  selector: string;
  componentType: Type<any>;
  parent: ViewDefinitionOld | null;
  factory: ComponentFactory<any>;
  resolver: ComponentFactoryResolver | null;
  rendererFactory: RendererFactory | null;
  providers: Provider[] | null;
  deps: any[] | null;
  childComponents: Provider[] | null;
  childDefs: ViewDefinitionOld[] | null;
  bindings: BindingDef[];
  bindingFlags: BindingFlags;
  outputs: OutputDef[];
  queries: QueryDef[] | null;
  handleEvent: HandleEventFn | null;
  element: ElementDef | null;
}
export function isViewDefinition(node: Node) { return node.type === NodeTypes.ViewDefinition; }
export interface HandleEventFn {
  (view: ViewData, eventName: string, bindingIndex: number, event: any): boolean;
}

/**
 * Provider
 */
export interface Provider extends Node {
  provider: ClassProvider | ConstructorProvider | ExistingProvider | FactoryProvider | ValueProvider;
}
export function isProvider(node: Node) { return node.type === NodeTypes.Provider; }

export interface OutputDef extends Node {
  target: 'window' | 'document' | 'body' | 'component' | null;
  eventName: string;
  propName: string | null;
}

export interface ProviderDef {
  token: any;
  value: any;
  deps: DepDef[];
}

export interface DepDef {
  flags: DepFlags;
  token: any;
  tokenKey: string;
}

/**
 * Bitmask for DI flags
 */
export const enum DepFlags {
  None = 0,
  SkipSelf = 1 << 0,
  Optional = 1 << 1,
  Value = 2 << 2,
}

/**
 * Element
 */
export interface ElementDef extends Node {
  name: string | null;
  ns: string | null;
  /** ns, name, value */
  attrs: [string, string, string][] | null;
  template: TemplateNodeDef[] | null;
}

/**
 * Template
 */
export enum TemplateTypes {
  Void,
  Element,
  Text,
  Comment,
  Attribute,
  EOF
}

export type TemplateElementDef = [TemplateTypes.Element, string, TemplateAttributeDef[], any[], boolean];
export type TemplateTextDef = [TemplateTypes.Text, string];
export type TeplateCommentDef = [TemplateTypes.Comment, string];
export type TemplateAttributeDef = [TemplateTypes.Attribute, string, string];
export type TemplateEOFDef = [TemplateTypes.EOF];
export type TemplateNodeDef = TemplateElementDef | TemplateTextDef | TeplateCommentDef | TemplateAttributeDef | TemplateEOFDef;

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
export function isBinding(node: Node) { return node.type === NodeTypes.Binding; }

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
export function isQuery(node: Node) { return node.type === NodeTypes.Query; }

/**
 * ViewData
 */
export interface ViewData {
  def: ViewDefinitionOld;
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
