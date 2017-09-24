import {NodeDef, NodeFlags, BindingFlags} from './types';
import {bindingDefs} from './element';

export function selectableDef(flags: NodeFlags, bindings?: [BindingFlags, string, string][]): NodeDef {
  bindings = bindings || [];
  const bindingDfs = bindingDefs(bindings);
  flags |= NodeFlags.TypeSelectable;
  return {
    // will bet set by the view definition
    index: -1,
    parent: null,
    renderParent: null,
    bindingIndex: -1,
    outputIndex: -1,
    // regular values
    flags,
    childFlags: 0,
    directChildFlags: 0,
    // childMatchedQueries: 0,
    // matchedQueries,
    // matchedQueryIds,
    // references,
    childCount: 0,
    bindings: null,
    bindingFlags: 0,
    outputs: null,
    element: null,
    provider: null,
    text: null,
    // query: null,
    selectable: null
  };
}
