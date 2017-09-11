import { Injector } from '../di/injector';
import { Renderer } from '../linker/renderer';
import { ElementRef } from '../linker/element_ref';
import { NodeDef, NodeFlags, DepDef, DepFlags, BindingDef, BindingFlags, OutputDef, OutputType, ViewData, QueryValueType } from './types';
import { tokenKey, splitDepsDsl, calcBindingFlags, isComponentView } from './util';
import { createInjector } from './refs';

const RendererTokenKey = tokenKey(Renderer);
const ElementRefTokenKey = tokenKey(ElementRef);
// const ViewContainerRefTokenKey = tokenKey(ViewContainerRef);
// const TemplateRefTokenKey = tokenKey(TemplateRef);
// const ChangeDetectorRefTokenKey = tokenKey(ChangeDetectorRef);
const InjectorRefTokenKey = tokenKey(Injector);

const NOT_CREATED = new Object();

export function componentDef(
  flags: NodeFlags, matchedQueries: [string | number, QueryValueType][], childCount: number,
  ctor: any, deps: ([DepFlags, any] | any)[], props?: { [name: string]: [number, string] },
  outputs?: { [name: string]: string }): NodeDef {
  const bindings: BindingDef[] = [];
  if (props) {
    for (let prop in props) {
      const [bindingIndex, nonMinifiedName] = props[prop];
      bindings[bindingIndex] = {
        flags: BindingFlags.TypeProperty,
        name: prop,
        nonMinifiedName,
        ns: null,
        suffix: null
      };
    }
  }
  const outputDefs: OutputDef[] = [];
  if (outputs) {
    for (let propName in outputs) {
      outputDefs.push(
        { type: OutputType.ComponentOutput, propName, target: null, eventName: outputs[propName] });
    }
  }
  flags |= NodeFlags.TypeComponent;
  return _def(flags, matchedQueries, childCount, ctor, ctor, deps, bindings, outputDefs);
}

export function providerDef(
  flags: NodeFlags, matchedQueries: [string | number, QueryValueType][], token: any, value: any,
  deps: ([DepFlags, any] | any)[]): NodeDef {
  return _def(flags, matchedQueries, 0, token, value, deps);
}

export function _def(flags: NodeFlags, matchedQueriesDsl: [string | number, QueryValueType][] | null,
  childCount: number, token: any, value: any, deps: ([DepFlags, any] | any)[],
  bindings?: BindingDef[], outputs?: OutputDef[]): NodeDef {
  // const { matchedQueries, references, matchedQueryIds } = splitMatchedQueriesDsl(matchedQueriesDsl);
  if (!outputs) {
    outputs = [];
  }
  if (!bindings) {
    bindings = [];
  }

  const depDefs = splitDepsDsl(deps);

  return {
    // will bet set by the view definition
    index: -1,
    parent: null,
    // renderParent: null,
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
    bindings,
    bindingFlags: calcBindingFlags(bindings), outputs,
    element: null,
    provider: { token, value, deps: depDefs },
    // text: null,
    // query: null,
  };
}

export function createProviderInstance(view: ViewData, def: NodeDef): any {
  return def.flags & NodeFlags.LazyProvider ? NOT_CREATED : _createProviderInstance(view, def);
}

export function createComponentInstance(view: ViewData, def: NodeDef): any {
  // components can see other private services, other directives can't.
  // const allowPrivateServices = (def.flags & NodeFlags.Component) > 0;
  // directives are always eager and classes!
  const instance = createClass(
    view, def.parent!, true, def.provider!.value, def.provider!.deps);
  // if (def.outputs.length) {
  //   for (let i = 0; i < def.outputs.length; i++) {
  //     const output = def.outputs[i];
  // const subscription = instance[output.propName !].subscribe(
  //     eventHandlerClosure(view, def.parent !.index, output.eventName));
  // view.disposables ![def.outputIndex + i] = subscription.unsubscribe.bind(subscription);
  //   }
  // }
  return instance;
}

function eventHandlerClosure(view: ViewData, index: number, eventName: string) {
  // return (event: any) => dispatchEvent(view, index, eventName, event);
}

function _createProviderInstance(view: ViewData, def: NodeDef): any {
  // private services can see other private services
  const allowPrivateServices = (def.flags & NodeFlags.PrivateProvider) > 0;
  const providerDef = def.provider;
  let injectable: any;
  switch (def.flags & NodeFlags.Types) {
    case NodeFlags.TypeClassProvider:
      injectable = createClass(
        view, def.parent!, allowPrivateServices, providerDef!.value, providerDef!.deps);
      break;
    case NodeFlags.TypeFactoryProvider:
      injectable = callFactory(
        view, def.parent!, allowPrivateServices, providerDef!.value, providerDef!.deps);
      break;
    case NodeFlags.TypeUseExistingProvider:
      injectable = resolveDep(view, def.parent!, allowPrivateServices, providerDef!.deps[0]);
      break;
    case NodeFlags.TypeValueProvider:
      injectable = providerDef!.value;
      break;
  }
  return injectable;
}

function createClass(
  view: ViewData, elDef: NodeDef, allowPrivateServices: boolean, ctor: any, deps: DepDef[]): any {
  const len = deps.length;
  let injectable: any;
  switch (len) {
    case 0:
      injectable = new ctor();
      break;
    case 1:
      injectable = new ctor(resolveDep(view, elDef, allowPrivateServices, deps[0]));
      break;
    case 2:
      injectable = new ctor(
        resolveDep(view, elDef, allowPrivateServices, deps[0]),
        resolveDep(view, elDef, allowPrivateServices, deps[1]));
      break;
    case 3:
      injectable = new ctor(
        resolveDep(view, elDef, allowPrivateServices, deps[0]),
        resolveDep(view, elDef, allowPrivateServices, deps[1]),
        resolveDep(view, elDef, allowPrivateServices, deps[2]));
      break;
    default:
      const depValues = new Array(len);
      for (let i = 0; i < len; i++) {
        depValues[i] = resolveDep(view, elDef, allowPrivateServices, deps[i]);
      }
      injectable = new ctor(...depValues);
  }
  return injectable;
}

function callFactory(
  view: ViewData, elDef: NodeDef, allowPrivateServices: boolean, factory: any,
  deps: DepDef[]): any {
  const len = deps.length;
  let injectable: any;
  switch (len) {
    case 0:
      injectable = factory();
      break;
    case 1:
      injectable = factory(resolveDep(view, elDef, allowPrivateServices, deps[0]));
      break;
    case 2:
      injectable = factory(
        resolveDep(view, elDef, allowPrivateServices, deps[0]),
        resolveDep(view, elDef, allowPrivateServices, deps[1]));
      break;
    case 3:
      injectable = factory(
        resolveDep(view, elDef, allowPrivateServices, deps[0]),
        resolveDep(view, elDef, allowPrivateServices, deps[1]),
        resolveDep(view, elDef, allowPrivateServices, deps[2]));
      break;
    default:
      const depValues = Array(len);
      for (let i = 0; i < len; i++) {
        depValues[i] = resolveDep(view, elDef, allowPrivateServices, deps[i]);
      }
      injectable = factory(...depValues);
  }
  return injectable;
}

// This default value is when checking the hierarchy for a token.
//
// It means both:
// - the token is not provided by the current injector,
// - only the element injectors should be checked (ie do not check module injectors
//
//          mod1
//         /
//       el1   mod2
//         \  /
//         el2
//
// When requesting el2.injector.get(token), we should check in the following order and return the
// first found value:
// - el2.injector.get(token, default)
// - el1.injector.get(token, NOT_FOUND_CHECK_ONLY_ELEMENT_INJECTOR) -> do not check the module
// - mod2.injector.get(token, default)
export const NOT_FOUND_CHECK_ONLY_ELEMENT_INJECTOR = {};

export function resolveDep(
  view: ViewData, elDef: NodeDef, allowPrivateServices: boolean, depDef: DepDef,
  notFoundValue: any = Injector.THROW_IF_NOT_FOUND): any {
  if (depDef.flags & DepFlags.Value) {
    return depDef.token;
  }
  const startView = view;
  if (depDef.flags & DepFlags.Optional) {
    notFoundValue = null;
  }
  const tokenKey = depDef.tokenKey;

  // if (tokenKey === ChangeDetectorRefTokenKey) {
  //   // directives on the same element as a component should be able to control the change detector
  //   // of that component as well.
  //   allowPrivateServices = !!(elDef && elDef.element!.componentView);
  // }

  if (elDef && (depDef.flags & DepFlags.SkipSelf)) {
    allowPrivateServices = false;
    elDef = elDef.parent!;
  }

  while (view) {
    if (elDef) {
      switch (tokenKey) {
        case RendererTokenKey: {
          // const compView = findCompView(view, elDef, allowPrivateServices);
          // return compView.renderer;
          throw new Error('not implemented');
        }
        case ElementRefTokenKey:
          throw new Error('not implemented');
        // return new ElementRef(asElementData(view, elDef.index).renderElement);
        // case ViewContainerRefTokenKey:
        //   return asElementData(view, elDef.index).viewContainer;
        // case TemplateRefTokenKey: {
        //   if (elDef.element!.template) {
        //     return asElementData(view, elDef.index).template;
        //   }
        //   break;
        // }
        // case ChangeDetectorRefTokenKey: {
        //   let cdView = findCompView(view, elDef, allowPrivateServices);
        //   return createChangeDetectorRef(cdView);
        // }
        case InjectorRefTokenKey:
          throw new Error('not implemented');
        // return createInjector(view, elDef);
        default:
        // const providerDef =
        //   (allowPrivateServices ? elDef.element!.allProviders :
        //     elDef.element!.publicProviders)![tokenKey];
        // if (providerDef) {
        //   const providerData = asProviderData(view, providerDef.index);
        //   if (providerData.instance === NOT_CREATED) {
        //     providerData.instance = _createProviderInstance(view, providerDef);
        //   }
        //   return providerData.instance;
        // }
      }
    }
    allowPrivateServices = isComponentView(view);
    // elDef = viewParentEl(view)!;
    // view = view.parent!;
  }

  // const value = startView.root.injector.get(depDef.token, NOT_FOUND_CHECK_ONLY_ELEMENT_INJECTOR);
  const value: any = null;

  if (value !== NOT_FOUND_CHECK_ONLY_ELEMENT_INJECTOR ||
    notFoundValue === NOT_FOUND_CHECK_ONLY_ELEMENT_INJECTOR) {
    // Return the value from the root element injector when
    // - it provides it
    //   (value !== NOT_FOUND_CHECK_ONLY_ELEMENT_INJECTOR)
    // - the module injector should not be checked
    //   (notFoundValue === NOT_FOUND_CHECK_ONLY_ELEMENT_INJECTOR)
    return value;
  }

  // return startView.root.ngModule.injector.get(depDef.token, notFoundValue);
}
