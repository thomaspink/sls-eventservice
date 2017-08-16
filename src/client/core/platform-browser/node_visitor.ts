import { Visitor } from '../compiler/visitor';
import { CssSelector, SelectorMatcher } from '../compiler/selector';

export class NodeVisitor extends Visitor {

  private _selectorMatcher = new SelectorMatcher();

  visitElement(element: Element) {
    const elementSelector = CssSelector.fromElement(element);
    this._selectorMatcher.match(elementSelector, (selector, selectable) => {
    });
  }

  private _visitComponent() {}
}
