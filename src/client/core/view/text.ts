import {NodeDef, BindingDef, BindingFlags, NodeFlags, ViewData, TextData} from './types';

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
    renderParent: null,
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
    // query: null,
    selectable: null
  };
}

export function createText(view: ViewData, renderHost: any, def: NodeDef): TextData {
  throw new Error(`createText not yet implemented`);
  // let renderNode: any;
  // const renderer = view.renderer;
  // renderNode = renderer.createText(def.text !.prefix);
  // const parentEl = getParentRenderElement(view, renderHost, def);
  // if (parentEl) {
  //   renderer.appendChild(parentEl, renderNode);
  // }
  // return {defIndex: def.index, renderText: renderNode};
}
