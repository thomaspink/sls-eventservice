import {
  NodeDef, NodeFlags, QueryValueType, BindingFlags, BindingDef, OutputDef, SelectableDef,
  OutputType, ViewDefinitionFactory, ElementHandleEventFn, ViewData, ElementData
} from './types';
import {NOOP, calcBindingFlags, splitNamespace, resolveRendererType, getParentRenderElement} from './util';
import {RendererType} from '../linker/renderer';

export function elementDef(
  flags: NodeFlags, matchedQueriesDsl: [string | number, QueryValueType][],
  childCount: number, namespaceAndName: string, fixedAttrs: [string, string][] = [],
  bindings?: [BindingFlags, string, string][], outputs?: ([string, string])[],
  handleEvent?: ElementHandleEventFn, componentView?: ViewDefinitionFactory,
  componentRendererType?: RendererType | null): NodeDef {

  if (!handleEvent) {
    handleEvent = NOOP;
  }
  // const { matchedQueries, references, matchedQueryIds } = splitMatchedQueriesDsl(matchedQueriesDsl);
  let ns: string = null!;
  let name: string = null!;
  if (namespaceAndName) {
    [ns, name] = splitNamespace(namespaceAndName);
  }
  bindings = bindings || [];
  const bindingDefs: BindingDef[] = new Array(bindings.length);
  for (let i = 0; i < bindings.length; i++) {
    const [bindingFlags, namespaceAndName, suffixOrSecurityContext] = bindings[i];

    const [ns, name] = splitNamespace(namespaceAndName);
    // let securityContext: SecurityContext = undefined!;
    let suffix: string = undefined!;
    if (bindingFlags & BindingFlags.TypeElementStyle) {
      suffix = <string>suffixOrSecurityContext;
    }
    bindingDefs[i] =
      {flags: bindingFlags, ns, name, nonMinifiedName: name, suffix};
  }
  outputs = outputs || [];
  const outputDefs: OutputDef[] = new Array(outputs.length);
  for (let i = 0; i < outputs.length; i++) {
    const [target, eventName] = outputs[i];
    outputDefs[i] = {
      type: OutputType.ElementOutput,
      target: <any>target, eventName,
      propName: null
    };
  }
  fixedAttrs = fixedAttrs || [];
  const attrs = <[string, string, string][]>fixedAttrs.map(([namespaceAndName, value]) => {
    const [ns, name] = splitNamespace(namespaceAndName);
    return [ns, name, value];
  });
  componentRendererType = resolveRendererType(componentRendererType);
  if (componentView) {
    flags |= NodeFlags.ComponentView;
  }
  flags |= NodeFlags.TypeElement;
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
    childCount,
    bindings: bindingDefs,
    bindingFlags: calcBindingFlags(bindingDefs),
    outputs: outputDefs,
    element: {
      ns,
      name,
      attrs,
      // template: null,
      // will bet set by the view definition
      componentProvider: null,
      componentView: componentView || null,
      componentRendererType: componentRendererType,
      publicProviders: null,
      allProviders: null,
      handleEvent: handleEvent || NOOP
    },
    provider: null,
    text: null,
    // query: null
  };
}

export function createElement(view: ViewData, renderHost: any, def: NodeDef): ElementData {
  const elDef = def.element !;
  const rootSelectorOrNode = view.root.selectorOrNode;
  const renderer = view.renderer;
  let el: any;
  if (view.parent || !rootSelectorOrNode) {
    if (elDef.name) {
      el = renderer.createElement(elDef.name, elDef.ns);
    } else {
      el = renderer.createComment('');
    }
    const parentEl = getParentRenderElement(view, renderHost, def);
    if (parentEl) {
      renderer.appendChild(parentEl, el);
    }
  } else {
    el = renderer.selectRootElement(rootSelectorOrNode);
  }
  if (elDef.attrs) {
    for (let i = 0; i < elDef.attrs.length; i++) {
      const [ns, name, value] = elDef.attrs[i];
      renderer.setAttribute(el, name, value, ns);
    }
  }
  return el;
}
