import { Type } from './type';
import { ComponentFactoryResolver } from './linker/component_factory_resolver';
import { ComponentFactory, ComponentRef } from './linker/component_factory';
import { Injector } from './di/injector';
import { VIEW_PROVIDERS } from './view/view';
import { REFLECTIVE_PROVIDERS } from './reflection/reflection';
import { COMPILER_PROVIDER, ComponentCompiler } from './compiler/compiler';

export class ApplicationRef {
  private _rootComponents: ComponentRef<any>[] = [];
  private _rootComponentTypes: Type<any>[] = [];
  constructor(private _injector: Injector,
    private _componentFactoryResolver: ComponentFactoryResolver) {

  }

  bootstrap<C>(componentOrFactory: ComponentFactory<C> | Type<C>) {
    let componentFactory: ComponentFactory<C>;
    if (componentOrFactory instanceof ComponentFactory) {
      componentFactory = componentOrFactory;
    } else {
      componentFactory =
        this._componentFactoryResolver.resolveComponentFactory(componentOrFactory)!;
    }
    this._rootComponentTypes.push(componentFactory.componentType);
    const compRef = componentFactory.create(componentFactory.selector, null, this._injector);
    return compRef;
  }
}

export function bootstrapComponent<C>(component: Type<C>) {
  const appInjector = Injector.create([REFLECTIVE_PROVIDERS, VIEW_PROVIDERS, COMPILER_PROVIDER]);
  const compiler: ComponentCompiler = appInjector.get(ComponentCompiler);
  const resolver = compiler.compile(component);
  const app = new ApplicationRef(appInjector, resolver);
  app.bootstrap(component);
}
