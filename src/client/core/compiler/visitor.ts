import { Type } from '../type';
import { stringify } from '../util';
import { ListWrapper } from '../util/collection';
import { Visitor } from '../linker/visitor';
import { ComponentFactory, ComponentRef } from '../linker/component_factory';
import { SelectorMatcher, CssSelector } from './selector';

export class CodegenVisitor implements Visitor {

  private _selectorMatcher = new SelectorMatcher();

  constructor(selectables: { selector: string, context: any }[],
    private _childVisitors?: Map<Type<any>, Visitor>) {
    selectables.forEach(selectable =>
      this._selectorMatcher.addSelectables(CssSelector.parse(selectable.selector),
        selectable.context));
  }

  visitElement(element: Element): Visitor | null {
    const elementSelector = CssSelector.fromElement(element);
    let ref: ComponentRef<any>;
    const ctxt: any[] = [];
    this._selectorMatcher.match(elementSelector, (selector, context) => {
      if (context instanceof ComponentFactory) {
        if (ref) {
          throw new Error(`The components ${stringify(ref.componentType)} and ` +
            `${stringify(context.componentType)} match the same element`);
        }
        ref = context.create(element, null, );
        ctxt.push(ref);
      }
    });
    if (ref && this._childVisitors) {
      return this._childVisitors.get(ref.componentType) || null;
    }
    return null;
  }

  visitAttribute(element: Element, attribute: Attr): Visitor | null {
    return null;
  }

  private _getComponentFromContext(context: any[]): ComponentRef<any> | null {
    return ListWrapper.findFirst(context, v => v instanceof ComponentRef);
  }
}
