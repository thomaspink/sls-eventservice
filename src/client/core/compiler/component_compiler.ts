import { Type } from '../type';
import { ComponentResolver } from './component_resolver';
import { Component } from '../metadata/components';
import { Reflector } from '../reflection/reflection';
import { ComponentFactory, ComponentRef } from '../linker/component_factory';
import {
  CodegenComponentFactoryResolver, ComponentFactoryResolver
} from '../linker/component_factory_resolver';
import { createComponentFactory } from '../view/view';

export class ComponentCompiler {
  private _metadata = new Map<Type<any>, Component>();
  private _factories = new Map<Type<any>, ComponentFactory<any>>();
  private _factoryResolvers = new Map<Type<any>, ComponentFactoryResolver>();

  constructor(private _resolver: ComponentResolver, private _reflector: Reflector) { }

  compile(component: Type<any>, parent?: ComponentFactoryResolver) {
    const metadata = this._resolveMetadata(component);
    const factories = this._collectFactories(component, metadata);
    const resolver = this._createFactoryResolver(component, factories);
    this._recursivelyCompileResolver([component]);
    return resolver;
  }

  private _recursivelyCompileResolver(components: Type<any>[], parent?: ComponentFactoryResolver) {
    let resolvers: ComponentFactoryResolver[] = [];
    components.forEach(component => {
      const metadata = this._resolveMetadata(component);
      if (!metadata.components || !metadata.components.length) {
        return;
      }
      if (this._factoryResolvers.has(component)) {
        return;
      }
      const factories = this._collectFactories(component, metadata);
      const resolver = this._createFactoryResolver(component, factories, parent);
      this._recursivelyCompileResolver(metadata.components, resolver);
    });
  }

  private _createFactoryResolver(component: Type<any>, factories: ComponentFactory<any>[],
    parent?: ComponentFactoryResolver) {
    const resolver = new CodegenComponentFactoryResolver(factories, parent);
    this._factoryResolvers.set(component, resolver);
    return resolver;
  }

  private _collectFactories(component: Type<any>, metadata?: Component) {
    if (!metadata) {
      metadata = this._resolveMetadata(component);
    }
    let factories = [this._resolveFactory(component)];
    metadata.components.forEach(child => {
      const childMeta = this._resolveMetadata(child);
      if (!childMeta.components || !childMeta.components.length) {
        factories.push(this._resolveFactory(child));
      }
    });
    return factories;
  }


  private _resolveMetadata(component: Type<any>): Component {
    let metadata = this._metadata.get(component);
    if (!metadata) {
      metadata = this._resolver.resolve(component);
    }
    return metadata;
  }

  private _resolveFactory(component: Type<any>): ComponentFactory<any> {
    let factory = this._factories.get(component);
    if (!factory) {
      const metadata = this._resolveMetadata(component);
      factory =
        createComponentFactory(metadata.selector, component, metadata.providers, metadata.deps);
      this._factories.set(component, factory);
    }
    return factory;
  }
}
