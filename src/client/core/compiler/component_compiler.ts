import { Type } from '../type';
import { stringify } from '../util';
import { splitAtColon } from './util';
import { ObjectWrapper, ListWrapper } from '../util/collection';
import { ComponentResolver } from './component_resolver';
import { ViewChildren, ViewChild } from '../metadata/di';
import { Reflector } from '../reflection/reflection';
import { ComponentFactory, ComponentRef } from '../linker/component_factory';
import {
  CodegenComponentFactoryResolver, ComponentFactoryResolver
} from '../linker/component_factory_resolver';
import { createComponentFactory, ELEMENT } from '../view/refs';
import {
  ViewDefinition, BindingFlags, BindingDef, ViewData, HandleEventFn, QueryDef, QueryBindingDef,
  QueryBindingType, QueryValueType, isQuery, NodeTypes, Provider, OutputDef
} from '../view/types';
import { CssSelector } from './selector';
import { RendererFactory } from '../linker/renderer';
import { Visitor } from '../linker/visitor';
import { CodegenVisitor, Selectable } from './visitor';
import { BindingCompiler } from './binding_compiler';
import { AST } from './expression_parser/ast';
import { ExpressionContext, ExpressionInterpreter } from './expression_parser/interpreter';

export class ComponentCompiler {
  private _viewDefs = new Map<Type<any>, ViewDefinition>();

  constructor(private _resolver: ComponentResolver, private bindingCompiler: BindingCompiler,
    private _rendererFactoryType: Type<RendererFactory>) { }

  compile(component: Type<any>, parentResolver?: ComponentFactoryResolver) {
    const { def, visitor } = this._recursivelyCompileViewDefs(component, 0);
    const resolver = new CodegenComponentFactoryResolver([def.factory],
      parentResolver || ComponentFactoryResolver.NULL);
    this._recusivelyCompileFactoryResolver(def, resolver);
    return resolver;
  }

  private _recursivelyCompileViewDefs(component: Type<any>, index: number, parent?: ViewDefinition):
    { def: ViewDefinition, visitor: Visitor | null } {
    const { def, selectables } = this._createViewDef(component, index, parent);
    const childVisitors = new Map<Type<any>, Visitor>();
    let visitor: CodegenVisitor | null = null;
    if (def.childComponents && def.childComponents.length) {
      const result = def.childComponents.map(c =>
        this._recursivelyCompileViewDefs(c.provider.provide, c.index, def));
      result.forEach(r => {
        if (r.visitor) {
          childVisitors.set(r.def.componentType, r.visitor);
        }
        selectables.unshift({ selector: r.def.selector, context: r.def });
      });
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
      viewDef.childComponents.forEach(compProvider => {
        const def = this._viewDefs.get(compProvider.provider.provide);
        return this._recusivelyCompileFactoryResolver(def, resolver);
      });
      viewDef.resolver = resolver;
      return resolver;
    }
    return null;
  }

  private _createViewDef(component: Type<any>, compIndex: number, parent?: ViewDefinition):
    { def: ViewDefinition, selectables: Selectable[] } {
    if (this._viewDefs.has(component)) {
      throw new Error(`Component ${stringify(component)} is has been declared multiple times. ` +
        `Please make sure a component is specified only once in the component tree`);
    }
    const metadata = this._resolver.resolve(component);
    const handler: { def: BindingDef, eventAst: AST }[] = [];
    const selectables: Selectable[] = [];
    const providers: Provider[] = [];
    const childComponents: Provider[] = [];
    const outputs: OutputDef[] = [];
    const queries: QueryDef[] = [];
    const bindings: BindingDef[] = [];
    let index = 0;
    let bindingFlags = 0;

    if (metadata.providers && metadata.providers.length) {
      ListWrapper.forEach(ListWrapper.flatten(metadata.providers), provider => {
        providers.push({
          index: index++,
          type: NodeTypes.Provider,
          provider
        });
      });
    }

    if (metadata.components && metadata.components.length) {
      ListWrapper.forEach(metadata.components, childComp => {
        const childMeta = this._resolver.resolve(childComp);
        childComponents.push({
          index: index++,
          type: NodeTypes.Provider,
          provider: {
            provide: childComp,
            useClass: childComp,
            deps: childMeta.deps
          }
        });
      });
    }

    ListWrapper.forEach(metadata.outputs, output => {
      const [propName, eventName] = splitAtColon(output, [output, output]);
      outputs.push({
        index: index++,
        type: NodeTypes.Output,
        target: 'component',
        propName,
        eventName
      });
    });

    ObjectWrapper.forEach(metadata.host, (binding, key) => {
      const { def, ast } = this.bindingCompiler.compile(key, metadata.host[key], index++,
        true, stringify(component));
      bindings.push(def);
      bindingFlags |= def.flags;
      handler.push({ def, eventAst: ast });
    });

    ObjectWrapper.forEach(metadata.bindings, (group, selector) => {
      ObjectWrapper.forEach(group, (binding, key) => {
        const { def, ast } = this.bindingCompiler.compile(key, group[key], index++,
          false, stringify(component));
        bindings.push(def);
        bindingFlags |= def.flags;
        handler.push({ def, eventAst: ast });
        selectables.push({ selector, context: def });
      });
    });

    ObjectWrapper.forEach(metadata.queries, (query: any, key) => {
      const selectable = selectables.find(s => s.selector === query.selector && isQuery(s.context));
      let def: QueryDef = selectable ? selectable.context : null;
      if (!def) {
        def = { index: index++, type: NodeTypes.Query, queryBindings: [] };
        queries.push(def);
      }
      let valueType = -1;
      if (query instanceof ViewChild || query instanceof ViewChildren) {
        valueType = query.read === ELEMENT ? QueryValueType.Element : QueryValueType.Component;
      } else {
        throw new Error(`Unknown query type: ${stringify(query.constructor)}`);
      }
      def.queryBindings.push({
        propName: key,
        bindingType: query.first ? QueryBindingType.First : QueryBindingType.All,
        valueType
      });
      if (!selectable) {
        selectables.push({ selector: query.selector, context: def });
      }
    });

    const def: ViewDefinition = {
      index: compIndex,
      type: NodeTypes.ViewDefinition,
      selector: metadata.selector,
      componentType: component,
      parent: parent || null,
      factory: null,
      resolver: null,
      rendererFactory: null,
      providers,
      deps: metadata.deps || null,
      childComponents,
      childDefs: null,
      bindings,
      bindingFlags,
      queries,
      outputs,
      handleEvent: this._createHandleEventFn(handler)
    };
    def.factory = createComponentFactory(metadata.selector, component, def);
    this._viewDefs.set(component, def);
    return { def, selectables };
  }

  private _createHandleEventFn(handler: { def: BindingDef, eventAst: AST }[]): HandleEventFn {
    const interpreter = new ExpressionInterpreter();
    const fns: Function[] = [];
    handler.forEach(h => {
      fns[h.def.index] = function (context: ExpressionContext) {
        return interpreter.visit(h.eventAst, context);
      };
    });
    return function (view: ViewData, eventName: string, index: number, event: any) {
      const vars = {};
      if (event) {
        vars['$event'] = event;
      }
      const context = new ExpressionContext(view, vars);
      const fn = fns[index];
      if (typeof fn !== 'function') {
        throw new Error(
          `No event handler for event ${eventName} found in ${stringify(view.component)}`);
      }
      return fn(context);
    }
  }
}

export function eventFullName(target: string | null, name: string): string {
  return target ? `${target}:${name}` : name;
}
