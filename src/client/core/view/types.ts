// tslint:disable:no-bitwise
import { Type } from '../type';
import { Provider } from '../di/provider';
import { Injector } from '../di/injector';
import { ComponentFactory } from '../linker/component_factory';
import { ComponentFactoryResolver } from '../linker/component_factory_resolver';
import { Renderer, RendererFactory } from '../linker/renderer';

export interface DisposableFn { (): void; }

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
  bindings: BindingDef[];
  bindingFlags: BindingFlags;
}

export interface BindingDef {
  flags: BindingFlags;
  ns: string|null;
  name: string|null;
  suffix: string|null;
  expression: any;
}

export const enum BindingFlags {
  TypeElementAttribute = 1 << 0,
  TypeElementClass = 1 << 1,
  TypeElementStyle = 1 << 2,
  TypeProperty = 1 << 3,
  TypeEvent = 1 << 4,
}

export interface ExpressionDef {
  nodes: string[];
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
