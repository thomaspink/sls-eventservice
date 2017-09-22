import {NodeDef, BindingDef, BindingFlags, NodeFlags} from './types';

export function textDef(staticText: string[]): NodeDef {
  const bindings: BindingDef[] = new Array(staticText.length - 1);
  for (let i = 1; i < staticText.length; i++) {
    bindings[i - 1] = {
      flags: BindingFlags.TypeProperty,
      name: null,
      ns: null,
      nonMinifiedName: null,
      suffix: staticText[i],
    };
  }

  return {
    // will bet set by the view definition
    index: -1,
    parent: null,
    bindingIndex: -1,
    outputIndex: -1,
    // regular values
    flags: NodeFlags.TypeText,
    childFlags: 0,
    directChildFlags: 0,
    // childMatchedQueries: 0,
    // matchedQueries: {},
    // matchedQueryIds: 0,
    // references: {},
    childCount: 0, bindings,
    bindingFlags: BindingFlags.TypeProperty,
    outputs: [],
    element: null,
    provider: null,
    text: {prefix: staticText[0]},
    // query: null
  };
}
