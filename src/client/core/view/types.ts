// tslint:disable:no-bitwise
// import { Type } from '../type';
// import { ClassProvider, ConstructorProvider, ExistingProvider, FactoryProvider, ValueProvider } from '../di/provider';
// import { Injector } from '../di/injector';
// import { ComponentFactory } from '../linker/component_factory';
// import { ComponentFactoryResolver } from '../linker/component_factory_resolver';
import { Renderer, RendererType } from '../linker/renderer';

export interface DefinitionFactory<D extends Definition<any>> { (): D; }

export interface Definition<DF extends DefinitionFactory<any>> { factory: DF|null; }

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
  childCount: number;
  /** aggregated NodeFlags for all transitive children (does not include self) **/
  childFlags: NodeFlags;
  /** aggregated NodeFlags for all direct children (does not include self) **/
  directChildFlags: NodeFlags;

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
  text: TextDef|null;
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
  ComponentView = 1 << 25,
  // TypeContentQuery = 1 << 26,
  TypeViewQuery = 1 << 27,
  // StaticQuery = 1 << 28,
  // DynamicQuery = 1 << 29,
  CatQuery = /*TypeContentQuery | */TypeViewQuery,

  // mutually exclusive values...
  Types = CatRenderNode | /*TypeNgContent | *//*TypePipe | *//*CatPureExpression | */CatProvider | CatQuery
}

export interface BindingDef {
  flags: BindingFlags;
  ns: string|null;
  name: string|null;
  nonMinifiedName: string|null;
  // securityContext: SecurityContext|null;
  suffix: string|null;
}

export const enum BindingFlags {
  TypeElementAttribute = 1 << 0,
  TypeElementClass = 1 << 1,
  TypeElementStyle = 1 << 2,
  TypeProperty = 1 << 3,
  SyntheticProperty = 1 << 4,
  SyntheticHostProperty = 1 << 5,
  CatSyntheticProperty = SyntheticProperty | SyntheticHostProperty,

  // mutually exclusive values...
  Types = TypeElementAttribute | TypeElementClass | TypeElementStyle | TypeProperty
}

export interface OutputDef {
  type: OutputType;
  target: 'window'|'document'|'body'|'component'|null;
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

export const enum OutputType {ElementOutput, ComponentOutput}

export const enum QueryValueType {
  ElementRef = 0,
  RenderElement = 1,
  TemplateRef = 2,
  ViewContainerRef = 3,
  Provider = 4
}

export interface TextDef { prefix: string; }

export interface ElementDef {
  name: string|null;
  ns: string|null;
  /** ns, name, value */
  attrs: [string, string, string][]|null;
  // template: ViewDefinition|null;
  componentProvider: NodeDef|null;
  componentRendererType: RendererType|null;
  // closure to allow recursive components
  componentView: ViewDefinitionFactory|null;
  /**
   * visible public providers for DI in the view,
   * as see from this element. This does not include private providers.
   */
  publicProviders: {[tokenKey: string]: NodeDef}|null;
  /**
   * same as visiblePublicProviders, but also includes private providers
   * that are located on this element.
   */
  allProviders: {[tokenKey: string]: NodeDef}|null;
  handleEvent: ElementHandleEventFn|null;
}

export interface ElementHandleEventFn { (view: ViewData, eventName: string, event: any): boolean; }

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
  // lastRenderRootNode: NodeDef|null;
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

/**
 * Provider
 */
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
 * View instance data.
 * Attention: Adding fields to this is performance sensitive!
 */
export interface ViewData {
  def: ViewDefinition;
  // root: RootData;
  renderer: Renderer;
  // index of component provider / anchor.
  parentNodeDef: NodeDef|null;
  parent: ViewData|null;
  viewContainerParent: ViewData|null;
  component: any;
  context: any;
  // Attention: Never loop over this, as this will
  // create a polymorphic usage site.
  // Instead: Always loop over ViewDefinition.nodes,
  // and call the right accessor (e.g. `elementData`) based on
  // the NodeType.
  nodes: {[key: number]: NodeData};
  state: ViewState;
  // oldValues: any[];
  disposables: DisposableFn[]|null;
}

/**
 * Bitmask of states
 */
export const enum ViewState {
  BeforeFirstCheck = 1 << 0,
  FirstCheck = 1 << 1,
  Attached = 1 << 2,
  ChecksEnabled = 1 << 3,
  IsProjectedView = 1 << 4,
  CheckProjectedView = 1 << 5,
  CheckProjectedViews = 1 << 6,
  Destroyed = 1 << 7,

  CatDetectChanges = Attached | ChecksEnabled,
  CatInit = BeforeFirstCheck | CatDetectChanges
}

export interface DisposableFn { (): void; }

/**
 * Node instance data.
 *
 * We have a separate type per NodeType to save memory
 * (TextData | ElementData | ProviderData | PureExpressionData | QueryList<any>)
 *
 * To keep our code monomorphic,
 * we prohibit using `NodeData` directly but enforce the use of accessors (`asElementData`, ...).
 * This way, no usage site can get a `NodeData` from view.nodes and then use it for different
 * purposes.
 */
export class NodeData { private __brand: any; }

/**
 * Data for an instantiated NodeType.Text.
 *
 * Attention: Adding fields to this is performance sensitive!
 */
export interface TextData { renderText: any; }

/**
 * Accessor for view.nodes, enforcing that every usage site stays monomorphic.
 */
export function asTextData(view: ViewData, index: number): TextData {
  return <any>view.nodes[index];
}
