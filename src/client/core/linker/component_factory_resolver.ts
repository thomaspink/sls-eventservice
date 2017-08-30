import { Type } from '../type';
import { stringify } from '../util';
import { ComponentFactory } from './component_factory';

export function noComponentFactoryError(component: Function) {
  const error = Error(`No component factory found for ${stringify(component)}. ` +
    `Did you add it to @NgModule.entryComponents?`);
  return error;
}

class NullComponentFactoryResolver implements ComponentFactoryResolver {
  resolveComponentFactory<T>(component: { new(...args: any[]): T }): ComponentFactory<T> {
    throw noComponentFactoryError(component);
  }
}

export abstract class ComponentFactoryResolver {
  static NULL: ComponentFactoryResolver = new NullComponentFactoryResolver();
  abstract resolveComponentFactory<T>(component: Type<T>): ComponentFactory<T>;
}

export class CodegenComponentFactoryResolver implements ComponentFactoryResolver {
  private _factories = new Map<any, ComponentFactory<any>>();

  constructor(factories: ComponentFactory<any>[], private _parent: ComponentFactoryResolver) {
    for (let i = 0; i < factories.length; i++) {
      const factory = factories[i];
      this._factories.set(factory.componentType, factory);
    }
  }

  resolveComponentFactory<T>(component: {new (...args: any[]): T}): ComponentFactory<T> {
    let factory = this._factories.get(component);
    if (!factory && this._parent) {
      factory = this._parent.resolveComponentFactory(component);
    }
    if (!factory) {
      throw noComponentFactoryError(component);
    }
    return factory;
  }
}
