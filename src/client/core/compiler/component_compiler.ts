import { Type } from '../type';
import { stringify } from '../util';
import { ComponentResolver } from './component_resolver';
import { Component } from '../metadata/components';
import { Reflector } from '../reflection/reflection';
import { ComponentFactory, ComponentRef } from '../linker/component_factory';
import {
  CodegenComponentFactoryResolver, ComponentFactoryResolver
} from '../linker/component_factory_resolver';
import { createComponentFactory } from '../view/refs';
import { ViewDefinition } from '../view/types';

export class ComponentCompiler {
  private _viewDefs = new Map<Type<any>, ViewDefinition>();

  constructor(private _resolver: ComponentResolver, private _reflector: Reflector) { }

  compile(component: Type<any>, parentResolver?: ComponentFactoryResolver) {
    const def = this._recursivelyCompileViewDefs(component);
    const resolver = new CodegenComponentFactoryResolver([def.factory],
      parentResolver || ComponentFactoryResolver.NULL);
    this._recusivelyCompileFactoryResolver(def, resolver);
    return resolver;
  }

  private _recursivelyCompileViewDefs(component: Type<any>, parent?: ViewDefinition) {
    const def = this._createViewDef(component, parent);
    if (def.childComponents && def.childComponents.length) {
      def.childDefs = def.childComponents.map(c => this._recursivelyCompileViewDefs(c, def));
    }
    return def;
  }

  private _recusivelyCompileFactoryResolver(viewDef: ViewDefinition,
    parent: ComponentFactoryResolver)  {

    if (viewDef.childDefs && viewDef.childDefs.length) {
      const factories = viewDef.childDefs.map(d => d.factory);
      const resolver = new CodegenComponentFactoryResolver(factories, parent);
      viewDef.childComponents.forEach(comp => {
        const def = this._viewDefs.get(comp);
        return this._recusivelyCompileFactoryResolver(def, resolver);
      });
      viewDef.resolver = resolver;
      return resolver;
    }
    return null;
  }

  private _createViewDef(component: Type<any>, parent?: ViewDefinition): ViewDefinition {
    if (this._viewDefs.has(component)) {
      throw new Error(`Component ${stringify(component)} is has been declared multiple times. ` +
        `Please make sure a component is specified only once in the component tree`);
    }
    const metadata = this._resolver.resolve(component);

    const def: ViewDefinition = {
      selector: metadata.selector,
      componentType: component,
      parent: parent || null,
      factory: null,
      resolver: null,
      providers: metadata.providers || null,
      deps: metadata.deps || null,
      childComponents: metadata.components || null,
      childDefs: null
    };
    def.factory = createComponentFactory(metadata.selector, component, def);
    this._viewDefs.set(component, def);
    return def;
  }
}
