import { Type } from '../type';
import { stringify } from '../util';
import { ListWrapper } from '../util/collection';
import { Visitor } from '../linker/visitor';
import { ComponentFactory, ComponentRef } from '../linker/component_factory';
import { SelectorMatcher, CssSelector } from './selector';
import { createComponentView, initView } from '../view/view';
import { createClass } from '../view/util';
import { ViewDefinition, ViewData } from '../view/types';
import { callLifecycleHook } from '../lifecycle_hooks';

export class CodegenVisitor implements Visitor {

  private _selectorMatcher = new SelectorMatcher();

  constructor(selectables: { selector: string, context: any }[],
    private _childVisitors?: Map<Type<any>, Visitor>) {
    selectables.forEach(selectable =>
      this._selectorMatcher.addSelectables(CssSelector.parse(selectable.selector),
        selectable.context));
  }

  visitElement(element: Element, context: any): any {
    const elementSelector = CssSelector.fromElement(element);
    let view: ViewData;
    this._selectorMatcher.match(elementSelector, (selector, obj) => {
      if (typeof obj === 'object') {
        if (view) {
          throw new Error(`The components ${stringify(view.def.componentType)} and ` +
            `${stringify(context.componentType)} match the same element`);
        }
        view = this._visitComponent(element, obj, context);
      }
    });
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

  private _visitComponent(element: Element, def: ViewDefinition, context: any) {
    const view = createComponentView(context, def, element);
    const instance = createClass(def.componentType, view.injector, view.def.deps);
    initView(view, instance, null);
    callLifecycleHook(instance, 'onInit');
    return view;
  }

  private _getComponentFromContext(context: any[]): ComponentRef<any> | null {
    return ListWrapper.findFirst(context, v => v instanceof ComponentRef);
  }
}
