import {Type} from '../type';
import {stringify} from '../util';
import {Injector} from '../di/injector';
import {RendererType} from '../linker/renderer';
import {
  Definition, DefinitionFactory, ViewData, DepFlags, DepDef, BindingDef, BindingFlags, NodeDef, NodeFlags,
  asElementData, asTextData, ElementData
} from './types';

export const NOOP: any = () => {};

const _tokenKeyCache = new Map<any, string>();

export function tokenKey(token: any): string {
  let key = _tokenKeyCache.get(token);
  if (!key) {
    key = stringify(token) + '_' + _tokenKeyCache.size;
    _tokenKeyCache.set(token, key);
  }
  return key;
}

export function createClass<C>(ctor: Type<C>, injector: Injector, deps: any[] = []): C {
  let resolvedDeps: any[] = [];
  if (deps && deps.length) {
    resolvedDeps = deps.map(dep => injector.get(dep));
  }
  const instance = new ctor(...resolvedDeps);
  return instance;
}

export function isComponentView(view: ViewData): boolean {
  return !!(view.def.nodeFlags & NodeFlags.Component);
}

export function splitDepsDsl(deps: ([DepFlags, any] | any)[]): DepDef[] {
  return deps.map(value => {
    let token: any;
    let flags: DepFlags;
    if (Array.isArray(value)) {
      [flags, token] = value;
    } else {
      flags = DepFlags.None;
      token = value;
    }
    return {flags, token, tokenKey: tokenKey(token)};
  });
}

const DEFINITION_CACHE = new WeakMap<any, Definition<any>>();

export function resolveDefinition<D extends Definition<any>>(factory: DefinitionFactory<D>): D {
  let value = DEFINITION_CACHE.get(factory)! as D;
  if (!value) {
    value = factory();
    value.factory = factory;
    DEFINITION_CACHE.set(factory, value);
  }
  return value;
}

const NS_PREFIX_RE = /^:([^:]+):(.+)$/;

export function splitNamespace(name: string): string[] {
  if (name[0] === ':') {
    const match = name.match(NS_PREFIX_RE)!;
    return [match[1], match[2]];
  }
  return ['', name];
}

export function calcBindingFlags(bindings: BindingDef[]): BindingFlags {
  let flags = 0;
  for (let i = 0; i < bindings.length; i++) {
    flags |= bindings[i].flags;
  }
  return flags;
}

const UNDEFINED_RENDERER_TYPE_ID = '$$undefined';
const EMPTY_RENDERER_TYPE_ID = '$$empty';
let _renderCompCount = 0;
export function resolveRendererType(type?: RendererType | null): RendererType | null {
  if (type && type.id === UNDEFINED_RENDERER_TYPE_ID) {
    // first time we see this RendererType2. Initialize it...
    const isFilled = Object.keys(type.data).length;
    if (isFilled) {
      type.id = `c${_renderCompCount++}`;
    } else {
      type.id = EMPTY_RENDERER_TYPE_ID;
    }
  }
  if (type && type.id === EMPTY_RENDERER_TYPE_ID) {
    type = null;
  }
  return type || null;
}

export function declaredViewContainer(view: ViewData): ElementData|null {
  if (view.parent) {
    const parentView = view.parent;
    return asElementData(parentView, view.parentNodeDef !.index);
  }
  return null;
}

/**
 * for component views, this is the host element.
 * for embedded views, this is the index of the parent node
 * that contains the view container.
 */
export function viewParentEl(view: ViewData): NodeDef | null {
  const parentView = view.parent;
  if (parentView) {
    return view.parentNodeDef!.parent;
  } else {
    return null;
  }
}

export function renderNode(view: ViewData, def: NodeDef): any {
  switch (def.flags & NodeFlags.Types) {
    case NodeFlags.TypeElement:
      return asElementData(view, def.index).renderElement;
    case NodeFlags.TypeText:
      return asTextData(view, def.index).renderText;
  }
}

export function getParentRenderElement(view: ViewData, renderHost: any, def: NodeDef): any {
  let renderParent = def.renderParent;
  if (renderParent) {
    if ((renderParent.flags & NodeFlags.TypeElement) === 0 ||
      (renderParent.flags & NodeFlags.ComponentView) === 0) {
      // only children of non components, or children of components with native encapsulation should
      // be attached.
      return asElementData(view, def.renderParent!.index).renderElement;
    }
  } else {
    return renderHost;
  }
}

export function rootRenderNodes(view: ViewData): any[] {
  const renderNodes: any[] = [];
  visitRootRenderNodes(view, RenderNodeAction.Collect, undefined, undefined, renderNodes);
  return renderNodes;
}

export const enum RenderNodeAction {Collect, AppendChild, InsertBefore, RemoveChild}

export function visitRootRenderNodes(
  view: ViewData, action: RenderNodeAction, parentNode: any, nextSibling: any, target?: any[]) {
  // We need to re-compute the parent node in case the nodes have been moved around manually
  if (action === RenderNodeAction.RemoveChild) {
    // parentNode = view.renderer.parentNode(renderNode(view, view.def.lastRenderRootNode!));
  }
  visitSiblingRenderNodes(
    view, action, 0, view.def.nodes.length - 1, parentNode, nextSibling, target);
}

export function visitSiblingRenderNodes(
  view: ViewData, action: RenderNodeAction, startIndex: number, endIndex: number, parentNode: any,
  nextSibling: any, target?: any[]) {
  for (let i = startIndex; i <= endIndex; i++) {
    const nodeDef = view.def.nodes[i];
    // if (nodeDef.flags & (NodeFlags.TypeElement | NodeFlags.TypeText | NodeFlags.TypeNgContent)) {
    //   visitRenderNode(view, nodeDef, action, parentNode, nextSibling, target);
    // }
    // jump to next sibling
    i += nodeDef.childCount;
  }
}

function visitRenderNode(
  view: ViewData, nodeDef: NodeDef, action: RenderNodeAction, parentNode: any, nextSibling: any,
  target?: any[]) {
  const rn = renderNode(view, nodeDef);
  if (action === RenderNodeAction.RemoveChild && (nodeDef.flags & NodeFlags.ComponentView) &&
    (nodeDef.bindingFlags & BindingFlags.CatSyntheticProperty)) {
    // Note: we might need to do both actions.
    if (nodeDef.bindingFlags & (BindingFlags.SyntheticProperty)) {
      execRenderNodeAction(view, rn, action, parentNode, nextSibling, target);
    }
    if (nodeDef.bindingFlags & (BindingFlags.SyntheticHostProperty)) {
      const compView = asElementData(view, nodeDef.index).componentView;
      execRenderNodeAction(compView, rn, action, parentNode, nextSibling, target);
    }
  } else {
    execRenderNodeAction(view, rn, action, parentNode, nextSibling, target);
  }
  // if (nodeDef.flags & NodeFlags.EmbeddedViews) {
  //   const embeddedViews = asElementData(view, nodeDef.index).viewContainer!._embeddedViews;
  //   for (let k = 0; k < embeddedViews.length; k++) {
  //     visitRootRenderNodes(embeddedViews[k], action, parentNode, nextSibling, target);
  //   }
  // }
  if (nodeDef.flags & NodeFlags.TypeElement && !nodeDef.element!.name) {
    visitSiblingRenderNodes(
      view, action, nodeDef.index + 1, nodeDef.index + nodeDef.childCount, parentNode,
      nextSibling, target);
  }
}

function execRenderNodeAction(
  view: ViewData, renderNode: any, action: RenderNodeAction, parentNode: any, nextSibling: any,
  target?: any[]) {
  const renderer = view.renderer;
  switch (action) {
    case RenderNodeAction.AppendChild:
      renderer.appendChild(parentNode, renderNode);
      break;
    case RenderNodeAction.InsertBefore:
      renderer.insertBefore(parentNode, renderNode, nextSibling);
      break;
    case RenderNodeAction.RemoveChild:
      renderer.removeChild(parentNode, renderNode);
      break;
    case RenderNodeAction.Collect:
      target!.push(renderNode);
      break;
  }
}
