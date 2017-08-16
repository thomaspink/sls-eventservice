export { OnInit, OnDestroy } from './lifecycle_hooks';
export { EventEmitter } from './events';
export { Injector } from './di/injector';
export { Component } from './metadata/components';
export { ApplicationRef, bootstrapComponent } from './application';
export { ELEMENT } from './view/refs';
export { ComponentFactory, ComponentRef } from './linker/component_factory';
export { ComponentFactoryResolver } from './linker/component_factory_resolver';
export {
  Provider, ClassProvider, ConstructorProvider, ExistingProvider, FactoryProvider,
  ValueProvider
} from './di/provider';
