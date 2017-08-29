import { Type } from '../type';
import { stringify } from '../util';
import { ComponentResolver } from './component_resolver';
import { ViewChildren, ViewChild } from '../metadata/di';
import { Reflector } from '../reflection/reflection';
import { ComponentFactory, ComponentRef } from '../linker/component_factory';
import {
  CodegenComponentFactoryResolver, ComponentFactoryResolver
} from '../linker/component_factory_resolver';
import { createComponentFactory } from '../view/refs';
import { ViewDefinition, BindingFlags, BindingDef, ViewData, HandleEventFn, QueryDef, QueryBindingDef, QueryBindingType, QueryValueType } from '../view/types';
import { CssSelector } from './selector';
import { RendererFactory } from '../linker/renderer';
import { Visitor } from '../linker/visitor';
import { CodegenVisitor } from './visitor';
import { BindingCompiler } from './binding_compiler';
import { AST } from './expression_parser/ast';
import { ExpressionContext, ExpressionInterpreter } from './expression_parser/interpreter';

export class ComponentCompiler {
  private _viewDefs = new Map<Type<any>, ViewDefinition>();

  constructor(private _resolver: ComponentResolver, private bindingCompiler: BindingCompiler,
    private _rendererFactoryType: Type<RendererFactory>) { }

  compile(component: Type<any>, parentResolver?: ComponentFactoryResolver) {
    const { def, visitor } = this._recursivelyCompileViewDefs(component);
    const resolver = new CodegenComponentFactoryResolver([def.factory],
      parentResolver || ComponentFactoryResolver.NULL);
    this._recusivelyCompileFactoryResolver(def, resolver);
    return resolver;
  }

  private _recursivelyCompileViewDefs(component: Type<any>, parent?: ViewDefinition):
    { def: ViewDefinition, visitor: Visitor | null } {
    const def = this._createViewDef(component, parent);
    const selectables: any[] = [];
    const childVisitors = new Map<Type<any>, Visitor>();
    let visitor: CodegenVisitor | null = null;
    if (def.childComponents && def.childComponents.length) {
      const result = def.childComponents.map(c => this._recursivelyCompileViewDefs(c, def));
      result.forEach(r => {
        if (r.visitor) {
          childVisitors.set(r.def.componentType, r.visitor);
        }
        selectables.push({selector: r.def.selector, context: r.def});
      });
    }
    if (def.queries && def.queries.length) {
      selectables.push(...def.queries);
    }
    visitor = new CodegenVisitor(selectables, childVisitors);
    def.rendererFactory = new this._rendererFactoryType(visitor);
    return { def, visitor };
  }

  private _recusivelyCompileFactoryResolver(viewDef: ViewDefinition,
    parent: ComponentFactoryResolver) {

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
    const context = Object.create({});
    const bindings: BindingDef[] = [];
    const handler: {def: BindingDef, eventAst: AST}[] = []
    let bindingFlags = 0;
    const queries: QueryDef[] = [];

    if (metadata.host) {
      for (var key in metadata.host) {
        if (metadata.host.hasOwnProperty(key)) {
          const {def, ast} =
            this.bindingCompiler.compile(key, metadata.host[key], context, stringify(component));
          bindings.push(def);
          // tslint:disable-next-line:no-bitwise
          bindingFlags |= def.flags;
          handler.push({def, eventAst: ast});
        }
      }
    }

    if(metadata.queries) {
      for (var key in metadata.queries) {
        if (metadata.queries.hasOwnProperty(key)) {
          const query = metadata.queries[key];
          let def = queries.find(q => q.selector === query.selector);
          if (!def) {
            def = { selector: query.selector, bindings: [] }
            queries.push(def);
          }
          let valueType = -1;
          if(query instanceof ViewChild || query instanceof ViewChildren) {
            valueType = QueryValueType.Component
          } else {
            throw new Error(`Unknown query type: ${stringify(query.constructor)}`);
          }
          def.bindings.push({
            propName: key,
            bindingType: query.first ? QueryBindingType.First : QueryBindingType.All,
            valueType
          });
        }
      }
    }

    const def: ViewDefinition = {
      selector: metadata.selector,
      componentType: component,
      parent: parent || null,
      factory: null,
      resolver: null,
      rendererFactory: null,
      providers: metadata.providers || null,
      deps: metadata.deps || null,
      childComponents: metadata.components || null,
      childDefs: null,
      bindings,
      bindingFlags,
      queries,
      handleEvent: this._createHandleEventFn(handler)
    };
    def.factory = createComponentFactory(metadata.selector, component, def);
    this._viewDefs.set(component, def);
    return def;
  }

  private _createHandleEventFn(handler: {def: BindingDef, eventAst: AST}[]): HandleEventFn {
    const interpreter = new ExpressionInterpreter();
    const map = new Map();
    handler.forEach(h => {
      const fullEventName = eventFullName(h.def.ns, h.def.name);
      map.set(fullEventName, function(context: ExpressionContext) { return interpreter.visit(h.eventAst, context); });
    });
    return function (view: ViewData, eventName: string, event: any) {
      const vars = {};
      if (event) {
        vars['$event'] = event;
      }
      const context = new ExpressionContext(view, vars);
      const fn = map.get(eventName);
      if (typeof fn !== 'function') {
        throw new Error(`No event handler for event ${eventName} found in ${stringify(view.component)}`);
      }
      return fn(context);
    }
  }
}

export function eventFullName(target: string | null, name: string): string {
  return target ? `${target}:${name}` : name;
}
