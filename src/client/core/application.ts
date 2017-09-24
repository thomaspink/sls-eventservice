import { Type } from './type';
import { ComponentFactoryResolver } from './linker/component_factory_resolver';
import { ComponentFactory, ComponentRef } from './linker/component_factory';
import { Injector } from './di/injector';
import { REFLECTIVE_PROVIDERS } from './reflection/reflection';
import { COMPILER_PROVIDER } from './compiler-runtime/compiler';
import { PLATFORM_BROWSER_PROVIDER } from './platform-browser/platform';
import { ViewRef, InternalViewRef } from './linker/view_ref';

import { JitCompiler } from './compiler-runtime/jit_compiler';

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

  bootstrap<C>(componentOrFactory: ComponentFactory<C> | Type<C>, rootSelectorOrNode?: string|any) {
    let componentFactory: ComponentFactory<C>;
    if (componentOrFactory instanceof ComponentFactory) {
      componentFactory = componentOrFactory;
    } else {
      componentFactory =
        this._componentFactoryResolver.resolveComponentFactory(componentOrFactory)!;
    }
    const selectorOrNode = rootSelectorOrNode || componentFactory.selector;
    const compRef = componentFactory.create(this, selectorOrNode);
    this._rootComponentTypes.push(componentFactory.componentType);
    // this.attachView(compRef.hostView);
    // return compRef;
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

  ngOnDestroy() {
    this._views.slice().forEach((view) => view.destroy());
  }

  /** Returns the number of attached views. */
  get viewCount() { return this._views.length; }
}

export function bootstrapComponent<C>(component: Type<C>) {
  const appInjector = Injector.create([
    PLATFORM_BROWSER_PROVIDER,
    REFLECTIVE_PROVIDERS,
    COMPILER_PROVIDER
  ]);
  const compiler: JitCompiler = appInjector.get(JitCompiler);
  const resolver = compiler.compileComponentSync(component);
  const app = new ApplicationRef(appInjector, resolver);
  app.bootstrap(component);
}

function remove<T>(list: T[], el: T): void {
  const index = list.indexOf(el);
  if (index > -1) {
    list.splice(index, 1);
  }
}
