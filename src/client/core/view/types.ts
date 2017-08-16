import { Type } from '../type';
import { Provider } from '../di/provider';
import { Injector } from '../di/injector';
import { ComponentFactory } from '../linker/component_factory';
import { ComponentFactoryResolver } from '../linker/component_factory_resolver';
import { Renderer } from '../linker/renderer';

export interface DisposableFn { (): void; }

export interface ViewDefinition {
  selector: string;
  componentType: Type<any>;
  parent: ViewDefinition|null;
  factory: ComponentFactory<any>;
  resolver: ComponentFactoryResolver|null;
  providers: Provider[]|null;
  deps: any[]|null;
  childComponents: Type<any>[]|null;
  childDefs: ViewDefinition[]|null;
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
}
