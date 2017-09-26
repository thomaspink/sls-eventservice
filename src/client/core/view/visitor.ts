import {Visitor} from '../linker/visitor';
import {ViewData, NodeFlags, NodeDef, SelectableDef} from './types';
import {createViewNodes} from './view';

export function createVisitor(): Visitor {return new Visitor_();}

class Visitor_ extends Visitor {

  visitElement(view: ViewData, el: any, name: string, attrs: [string, string, string][] | null,
    classNames: string[] | null): ViewData | null {
    view.def.nodes.forEach(nodeDef => {
      if (nodeDef.flags & NodeFlags.CatSelectable && match(nodeDef.selectable, name, attrs, classNames)) {
        if (nodeDef.flags & NodeFlags.TypeElement && nodeDef.flags & NodeFlags.ComponentView) {
          this._visitComponent(view, nodeDef, el);
        }
        // createViewNodes(view, false, node.index, el);
      }
    });
    return null;
  }

  visitAttribute(view: ViewData, name: string, value: string | null) {

  }

  finish(view: ViewData) {

  }

  private _visitComponent(view: ViewData, elementDef: NodeDef, el: any) {
    const nodes = view.def.nodes;
    const startIndex = elementDef.index;
    let endIndex = startIndex
    while (!(nodes[++endIndex].flags & NodeFlags.TypeElement) && endIndex <= nodes.length) { }
    createViewNodes(view, false, startIndex, endIndex, el);
  }
}

function match(selectable: SelectableDef, name: string | null, attrs: [string, string, string][] | null, classNames: string[] | null) {
  if (selectable.name && selectable.name !== name) return false;
  if (selectable.classNames.find(c => classNames.indexOf(c) === -1)) return false;
  if (selectable.attrs.find(a1 => attrs.findIndex(a2 => a1[0] === a2[1] && a1[1] === a2[2]) === -1)) return false;
  return true;
}
