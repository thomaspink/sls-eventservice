import {Renderer, RendererFactory} from '../linker/renderer';
import {Injector} from '../di/injector';
import {
  NodeDef, ViewDefinition, ViewHandleEventFn, NodeFlags, NodeData, ViewData, ViewState,
  ElementData, ProviderData, asElementData, RootData
} from './types';
import {tokenKey, resolveDefinition} from './util';
import {createText} from './text';
import {createElement} from './element';
import {createProviderInstance, createComponentInstance} from './provider';

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

export function createRootData(injector: Injector, rendererFactory: RendererFactory,
  rootSelectorOrNode: any): RootData {
  const renderer = rendererFactory.createRenderer(null, null);
  return {injector, selectorOrNode: rootSelectorOrNode, rendererFactory, renderer};
}

export function createRootView(root: RootData, def: ViewDefinition, context?: any): ViewData {
  const view = createView(root, root.renderer, null, null, def);
  initView(view, context, context);
  createViewNodes(view);
  return view;
}

export function createComponentView(parentView: ViewData, nodeDef: NodeDef,
  viewDef: ViewDefinition, hostElement: any): ViewData {
  const rendererType = nodeDef.element!.componentRendererType;
  let compRenderer: Renderer;
  if (!rendererType) {
    compRenderer = parentView.root.renderer;
  } else {
    compRenderer = parentView.root.rendererFactory.createRenderer(hostElement, rendererType);
  }
  return createView(parentView.root, compRenderer, parentView, nodeDef.element!.componentProvider, viewDef);
}

function createView(root: RootData, renderer: Renderer, parent: ViewData | null,
  parentNodeDef: NodeDef | null, def: ViewDefinition): ViewData {
  const nodes: NodeData[] = new Array(def.nodes.length);
  const disposables = def.outputCount ? new Array(def.outputCount) : null;
  const view: ViewData = {
    def,
    parent,
    root,
    viewContainerParent: null,
    parentNodeDef,
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

function createViewNodes(view: ViewData, rootEl?: any) {
  if (rootEl && rootEl !== 'object') {
    throw new Error(`The root element has to be of type Elment, not ${typeof rootEl}!`);
  }
  let renderHost: any;
  // if (isComponentView(view)) {
  //   const hostDef = view.parentNodeDef;
  //   renderHost = asElementData(view.parent !, hostDef !.parent !.index).renderElement;
  // }


  const def = view.def;
  const nodes = view.nodes;
  let isFirstEl = true;
  for (let i = 0; i < def.nodes.length; i++) {
    const nodeDef = def.nodes[i];
    // Services.setCurrentNode(view, i);
    let nodeData: any;
    switch (nodeDef.flags & NodeFlags.Types) {
      case NodeFlags.TypeElement:
        let el: any;
        if (isFirstEl && rootEl) {
          el = rootEl;
          isFirstEl = false;
        } else {
          el = createElement(view, renderHost, nodeDef) as any;
        }
        let componentView: ViewData = undefined!;
        if (nodeDef.flags & NodeFlags.ComponentView) {
          const compViewDef = resolveDefinition(nodeDef.element!.componentView!);
          componentView = createComponentView(view, nodeDef, compViewDef, el);
        }
        // listenToElementOutputs(view, componentView, nodeDef, el);
        nodeData = <ElementData>{
          renderElement: el,
          componentView,
          viewContainer: null,
          // template: nodeDef.element !.template ? createTemplateData(view, nodeDef) : undefined
        };
        // if (nodeDef.flags & NodeFlags.EmbeddedViews) {
        //   nodeData.viewContainer = createViewContainerData(view, nodeDef, nodeData);
        // }
        break;
      case NodeFlags.TypeText:
        nodeData = createText(view, renderHost, nodeDef) as any;
        break;
      case NodeFlags.TypeClassProvider:
      case NodeFlags.TypeFactoryProvider:
      case NodeFlags.TypeUseExistingProvider:
      case NodeFlags.TypeValueProvider: {
        const instance = createProviderInstance(view, nodeDef);
        nodeData = <ProviderData>{instance};
        break;
      }
      // case NodeFlags.TypePipe: {
      //   const instance = createPipeInstance(view, nodeDef);
      //   nodeData = <ProviderData>{instance};
      //   break;
      // }
      case NodeFlags.TypeComponent: {
        const instance = createComponentInstance(view, nodeDef);
        nodeData = <ProviderData>{instance};
        if (nodeDef.flags & NodeFlags.Component) {
          const compView = asElementData(view, nodeDef.parent!.index).componentView;
          initView(compView, instance, instance);
        }
        break;
      }
      // case NodeFlags.TypePureArray:
      // case NodeFlags.TypePureObject:
      // case NodeFlags.TypePurePipe:
      //   nodeData = createPureExpression(view, nodeDef) as any;
      //   break;
      // case NodeFlags.TypeContentQuery:
      // case NodeFlags.TypeViewQuery:
      //   nodeData = createQuery() as any;
      //   break;
    }
    nodes[i] = nodeData;
  }
  // Create the ViewData.nodes of component views after we created everything else,
  // so that e.g. ng-content works
  // execComponentViewsAction(view, ViewAction.CreateViewNodes);

  // fill static content and view queries
  // execQueriesAction(
  //     view, NodeFlags.TypeContentQuery | NodeFlags.TypeViewQuery, NodeFlags.StaticQuery,
  //     CheckType.CheckAndUpdate);
}
