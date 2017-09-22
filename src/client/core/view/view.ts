import {NodeDef, ViewDefinition, ViewHandleEventFn, NodeFlags, NodeData, ViewData, ViewState} from './types';
import {tokenKey} from './util';
import {Renderer} from '../linker/renderer';

export function viewDef(nodes: NodeDef[]): ViewDefinition {
  let viewBindingCount = 0;
  let viewDisposableCount = 0;
  let viewNodeFlags = 0;
  let viewRootNodeFlags = 0;
  let viewMatchedQueries = 0;
  let currentParent: NodeDef | null = null;
  let currentElementHasPublicProviders = false;
  let currentElementHasPrivateProviders = false;
  for (let i = 0; i < nodes.length; i++) {

    const node = nodes[i];
    node.index = i;
    node.parent = currentParent;
    node.bindingIndex = viewBindingCount;
    node.outputIndex = viewDisposableCount;

    if (node.element) {
      const elDef = node.element;
      elDef.publicProviders =
        currentParent ? currentParent.element!.publicProviders : Object.create(null);
      elDef.allProviders = elDef.publicProviders;
      // Note: We assume that all providers of an element are before any child element!
      currentElementHasPublicProviders = false;
      currentElementHasPrivateProviders = false;
    }
    validateNode(currentParent, node, nodes.length);

    viewBindingCount += node.bindings.length;
    viewDisposableCount += node.outputs.length;

    if (currentParent) {
      currentParent.childFlags |= node.flags;
      currentParent.directChildFlags |= node.flags;
      // currentParent.childMatchedQueries |= node.matchedQueryIds;
      // if (node.element && node.element.template) {
      //   currentParent.childMatchedQueries |= node.element.template.nodeMatchedQueries;
      // }
    } else {
      viewRootNodeFlags |= node.flags;
    }

    if (node.flags & NodeFlags.CatProvider) {
      if (!currentElementHasPublicProviders) {
        currentElementHasPublicProviders = true;
        // Use prototypical inheritance to not get O(n^2) complexity...
        currentParent!.element!.publicProviders =
          Object.create(currentParent!.element!.publicProviders);
        currentParent!.element!.allProviders = currentParent!.element!.publicProviders;
      }
      const isPrivateService = (node.flags & NodeFlags.PrivateProvider) !== 0;
      const isComponent = (node.flags & NodeFlags.Component) !== 0;
      if (!isPrivateService || isComponent) {
        currentParent!.element!.publicProviders![tokenKey(node.provider!.token)] = node;
      } else {
        if (!currentElementHasPrivateProviders) {
          currentElementHasPrivateProviders = true;
          // Use prototypical inheritance to not get O(n^2) complexity...
          currentParent!.element!.allProviders =
            Object.create(currentParent!.element!.publicProviders);
        }
        currentParent!.element!.allProviders![tokenKey(node.provider!.token)] = node;
      }
      if (isComponent) {
        currentParent!.element!.componentProvider = node;
      }
    }

    if (node.childCount > 0 || (node.element && !currentParent)) {
      currentParent = node;
    } else {
      // When the current node has no children, check if it is the last children of its parent.
      // When it is, propagate the flags up.
      // The loop is required because an element could be the last transitive children of several
      // elements. We loop to either the root or the highest opened element (= with remaining
      // children)
      while (currentParent && i === currentParent.index + currentParent.childCount) {
        const newParent: NodeDef | null = currentParent.parent;
        if (newParent) {
          newParent.childFlags |= currentParent.childFlags;
          // newParent.childMatchedQueries |= currentParent.childMatchedQueries;
        }
        currentParent = newParent;
      }
    }
  }

  const handleEvent: ViewHandleEventFn = (view, nodeIndex, eventName, event) =>
    nodes[nodeIndex].element!.handleEvent!(view, eventName, event);

  return {
    // Will be filled later...
    factory: null,
    nodeFlags: viewNodeFlags,
    rootNodeFlags: viewRootNodeFlags,
    nodeMatchedQueries: viewMatchedQueries,
    nodes: nodes,
    // updateDirectives: updateDirectives || NOOP,
    // updateRenderer: updateRenderer || NOOP,
    handleEvent,
    bindingCount: viewBindingCount,
    outputCount: viewDisposableCount,
  };
}

function validateNode(parent: NodeDef | null, node: NodeDef, nodeCount: number) {
  // const template = node.element && node.element.template;
  // if (template) {
  //   if (!template.lastRenderRootNode) {
  //     throw new Error(`Illegal State: Embedded templates without nodes are not allowed!`);
  //   }
  //   if (template.lastRenderRootNode &&
  //       template.lastRenderRootNode.flags & NodeFlags.EmbeddedViews) {
  //     throw new Error(
  //         `Illegal State: Last root node of a template can't have embedded views, at index ${node.index}!`);
  //   }
  // }
  if (node.flags & NodeFlags.CatProvider) {
    const parentFlags = parent ? parent.flags : 0;
    if ((parentFlags & NodeFlags.TypeElement) === 0) {
      throw new Error(
        `Illegal State: StaticProvider/Directive nodes need to be children of elements or anchors, at index ${node.index}!`);
    }
  }
  // if (node.query) {
  //   if (node.flags & NodeFlags.TypeContentQuery &&
  //       (!parent || (parent.flags & NodeFlags.TypeDirective) === 0)) {
  //     throw new Error(
  //         `Illegal State: Content Query nodes need to be children of directives, at index ${node.index}!`);
  //   }
  //   if (node.flags & NodeFlags.TypeViewQuery && parent) {
  //     throw new Error(
  //         `Illegal State: View Query nodes have to be top level nodes, at index ${node.index}!`);
  //   }
  // }
  if (node.childCount) {
    const parentEnd = parent ? parent.index + parent.childCount : nodeCount - 1;
    if (node.index <= parentEnd && node.index + node.childCount > parentEnd) {
      throw new Error(
        `Illegal State: childCount of node leads outside of parent, at index ${node.index}!`);
    }
  }
}

export function createRootView(rootRenderer: Renderer, def: ViewDefinition, context?: any): ViewData {
  const view = createView(rootRenderer, null, null, def);
  initView(view, context, context);
  // createViewNodes(view);
  return view;
}

function createView(renderer: Renderer, parent: ViewData | null, parentNodeDef: NodeDef | null, def: ViewDefinition): ViewData {
  const nodes: NodeData[] = new Array(def.nodes.length);
  const disposables = def.outputCount ? new Array(def.outputCount) : null;
  const view: ViewData = {
    def,
    parent,
    viewContainerParent: null, parentNodeDef,
    context: null,
    component: null, nodes,
    state: ViewState.CatInit,
    // root,
    renderer,
    // oldValues: new Array(def.bindingCount),
    disposables
  };
  return view;
}

function initView(view: ViewData, component: any, context: any) {
  view.component = component;
  view.context = context;
}
