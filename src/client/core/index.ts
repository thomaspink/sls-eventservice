export {
  registerComponent, destroyComponent, updateDOM, ComponentFactory, ComponentRef,
  getComponentOnElement, getComponentsOnElement, ELEMENT
} from './component';
export { OnInit, OnDestroy } from './lifecycle_hooks';
export { EventEmitter } from './events';
export { Injector } from './di/injector';
export {
  Provider, ClassProvider, ConstructorProvider, ExistingProvider, FactoryProvider,
  ValueProvider
} from './di/provider';
