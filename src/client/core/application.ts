import { Type } from './type';
import { ComponentFactoryResolver } from './linker/component_factory_resolver';
import { ComponentFactory, ComponentRef } from './linker/component_factory';
import { Injector } from './di/injector';
import { InjectionToken } from './di/injection_token';
import { REFLECTIVE_PROVIDERS } from './reflection/reflection';
import { COMPILER_PROVIDER, ComponentCompiler } from './compiler/compiler';
import { PLATFORM_BROWSER_PROVIDER } from './platform-browser/platform';
import { ViewRef, InternalViewRef } from './linker/view_ref';

export class ApplicationRef extends Injector {
  private _rootComponents: ComponentRef<any>[] = [];
  private _rootComponentTypes: Type<any>[] = [];
  private _views: InternalViewRef[] = [];

  get componentTypes(): Type<any>[] { return this._rootComponentTypes; }
  get components(): ComponentRef<any>[] { return this._rootComponents; }

  constructor(private _injector: Injector,
    private _componentFactoryResolver: ComponentFactoryResolver) {
    super();
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
    const compRef = componentFactory.create(null, this, null);
    this.attachView(compRef.hostView);
    return compRef;
  }

  attachView(viewRef: ViewRef): void {
    const view = (viewRef as InternalViewRef);
    this._views.push(view);
    view.attachToAppRef(this);
  }

  detachView(viewRef: ViewRef): void {
    const view = (viewRef as InternalViewRef);
    remove(this._views, view);
    view.detachFromAppRef();
  }


  get(token: any, notFoundValue?: any): any {
    if (token === ComponentFactoryResolver) {
      return this._componentFactoryResolver;
    }
    if (token === ApplicationRef || token === Injector) {
      return this;
    }
    return this._injector.get(token, notFoundValue);
  }
}

export function bootstrapComponent<C>(component: Type<C>) {
  const appInjector = Injector.create([
    PLATFORM_BROWSER_PROVIDER,
    REFLECTIVE_PROVIDERS,
    COMPILER_PROVIDER
  ]);
  const compiler: ComponentCompiler = appInjector.get(ComponentCompiler);
  const resolver = compiler.compile(component);
  const app = new ApplicationRef(appInjector, resolver);
  app.bootstrap(component);
}

function remove<T>(list: T[], el: T): void {
  const index = list.indexOf(el);
  if (index > -1) {
    list.splice(index, 1);
  }
}
