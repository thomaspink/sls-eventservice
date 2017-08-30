import { Type } from '../type';
import { stringify } from '../util';
import { ListWrapper } from '../util/collection';
import { Visitor } from '../linker/visitor';
import { ComponentFactory, ComponentRef } from '../linker/component_factory';
import { QueryList } from '../linker/query_list';
import { SelectorMatcher, CssSelector } from './selector';
import { createComponentView, initView } from '../view/view';
import { createClass } from '../view/util';
import {
  ViewDefinition, ViewData, QueryDef, QueryBindingDef, QueryBindingType, QueryValueType,
  Node, isBinding, isQuery, isViewDefinition, BindingDef, BindingFlags
} from '../view/types';
import { callLifecycleHook } from '../lifecycle_hooks';

export interface Selectable {
  selector: any;
  context: any;
}

export class CodegenVisitor implements Visitor {

  private _selectorMatcher = new SelectorMatcher();
  private _ctorQueries = new Map<Type<any>, QueryBindingDef[]>();
  private _ctorBindings = new Map<Type<any>, BindingDef>();
  private _queries = new Map<string, any | any[]>();

  constructor(selectables: { selector: any, context: Node }[],
    private _childVisitors?: Map<Type<any>, Visitor>) {
    selectables.forEach(selectable => {
      const selector = selectable.selector;
      if (typeof selector === 'string') {
        this._selectorMatcher.addSelectables(CssSelector.parse(selector), selectable.context);
      } else if (selector instanceof Function) {
        if (isQuery(selectable.context)) {
          let queryBindings = this._ctorQueries.get(selector);
          if (!queryBindings) {
            queryBindings = [];
            this._ctorQueries.set(selector, queryBindings);
          }
          queryBindings.push(...(selectable.context as QueryDef).queryBindings);
        }
      } else if (isBinding(selectable.context)) {
        this._ctorBindings.set(selector, selectable.context as BindingDef);
      }
    });
  }

  visitElement(element: Element, context: ViewData): any {
    const elementSelector = CssSelector.fromElement(element);
    let view: ViewData;
    let queries: QueryDef[] = [];
    let bindings: BindingDef[] = [];
    this._selectorMatcher.match(elementSelector, (selector, selectable: Node) => {
      if (isViewDefinition(selectable)) {
        if (view) {
          throw new Error(`The components ${stringify(view.def.componentType)} and ` +
            `${stringify(context.def.componentType)} match the same element`);
        }
        view = this._visitComponent(element, selectable as ViewDefinition, context);
      } else if (isQuery(selectable)) {
        queries.push(selectable as QueryDef);
      } else if (isBinding(selectable)) {
        bindings.push(selectable as BindingDef);
      }
    });

    if (this._ctorQueries.size && view && this._ctorQueries.has(view.def.componentType)) {
      const bindings = this._ctorQueries.get(view.def.componentType);
      this._visitQuery(view, bindings);
    }
    if (queries && queries.length) {
      queries.forEach(q => this._visitQuery(view, q.queryBindings));
    }

    if (this._ctorBindings.size && view && this._ctorBindings.has(view.def.componentType)) {
      const bindings = this._ctorQueries.get(view.def.componentType);
      this._visitComponentBinding();
    }
    if (bindings && bindings.length) {
      bindings.forEach(binding => {
        if (view) {
          this._visitComponentBinding();
        } else {
          this._visitElementBinding(element, context, binding);
        }
      });
    }

    if (view && this._childVisitors) {
      return {
        visitor: this._childVisitors.get(view.def.componentType) || null,
        context: view
      };
    }
    return null;
  }

  visitAttribute(element: Element, attribute: Attr, context: any) {
  }

  finish(context: any) {
    this._queries.forEach((value, key) => {
      if (Array.isArray(value)) {
        const list = new QueryList();
        list.reset(value);
        value = list;
      }
      context.component[key] = value;
    });
    callLifecycleHook(context, 'onInit');
  }

  private _visitComponent(element: Element, def: ViewDefinition, context: any) {
    const view = createComponentView(context, def, element);
    const instance = createClass(def.componentType, view.injector, view.def.deps);
    initView(view, instance, null);
    return view;
  }

  private _visitQuery(view: ViewData, bindings: QueryBindingDef[]) {
    bindings.forEach(b => {
      let value = this._queries.get(b.propName);
      if (b.bindingType === QueryBindingType.First) {
        if (!value) {
          this._queries.set(b.propName, this._getQueryValue(view, b));
        }
      } else {
        if (!value) {
          value = [];
          this._queries.set(b.propName, value);
        }
        value.push(this._getQueryValue(view, b));
      }
    });
  }

  private _visitComponentBinding() {

  }


  private _visitElementBinding(element: Element, view: ViewData, binding: BindingDef) {
    if(binding.flags & BindingFlags.TypeEvent) {
      view.disposables.push(view.renderer.listen(element, binding.name,
        (event) => view.def.handleEvent(view, binding.name, binding.index, event)));
    }
  }

  private _getQueryValue(view: ViewData, query: QueryBindingDef) {
    switch (query.valueType) {
      case QueryValueType.Component:
        return view.component;
      case QueryValueType.Element:
        return view.hostElement;
    }
  }

  private _getComponentFromContext(context: any[]): ComponentRef<any> | null {
    return ListWrapper.findFirst(context, v => v instanceof ComponentRef);
  }
}
