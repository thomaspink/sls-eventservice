import { Type } from '../type';
import { Provider } from '../di/provider';
import { Injector } from '../di/injector';
import { NodeDef } from './types';

export function viewDef(nodes: NodeDef[]) {

}

// export function createComponentView(parent: ViewData|null, viewDef: ViewDefinitionOld,
//   rootSelectorOrNode?: any, renderHost?: any, injector?: Injector): ViewData {
  // const renderer: Renderer = viewDef.rendererFactory.createRenderer();
  // const providers = viewDef.providers.map(p => p.provider);
  // if (viewDef.resolver) {
  //   providers.unshift({
  //     provide: ComponentFactoryResolver,
  //     useValue: viewDef.resolver
  //   });
  // }
  // const parentInjector = injector || (parent && parent.injector) || void 0;
  // const inj = Injector.create(providers, parentInjector);
  // const view = createView(null, renderer, parent, viewDef, inj);
  // if (!hostElement) {
  //   hostElement = createElement(view, renderHost, viewDef);
  // }
  // view.hostElement = hostElement;
  // const disposables: DisposableFn[] = [];
  // if (viewDef.bindings)
  //   viewDef.bindings.forEach(binding => {
  //     if (binding.isHost && binding.flags & BindingFlags.TypeEvent) {
  //       disposables.push(renderer.listen(hostElement, binding.name,
  //         (event) => viewDef.handleEvent(view, binding.name, binding.index, event)));
  //     }
  //   });
  // view.disposables = disposables;
  // return view;
//   return null;
// }

// function createRootView(elInjector: Injector, rootSelectorOrNode: string | any, def: ViewDefinitionOld) {

// }

// function createView(hostElement: any, renderer: Renderer | null, parent: ViewData | null,
//   def: ViewDefinitionOld, injector: Injector|null): ViewData {
//   const view: ViewData = {
//     def,
//     renderer,
//     parent,
//     context: null,
//     hostElement,
//     component: null,
//     injector,
//     disposables: null,
//     childViews: null
//   };
//   if (parent) {
//     attachView(parent, view);
//   }
//   return view;
// }

// export function initView(view: ViewData, component: any, context: any) {
//   view.component = component;
//   view.context = context;
// }

// export function destroyView(view: ViewData) {
//   if (view.disposables) {
//     for (let i = 0; i < view.disposables.length; i++) {
//       view.disposables[i]();
//     }
//   }
//   callLifecycleHook(view.component, 'onDestroy');
//   if (view.childViews) {
//     view.childViews.forEach(v => destroyView(v));
//   }

//   // TODO: Maybe change this in a later stage
//   const el = view.hostElement;
//   view.renderer.removeChild(view.renderer.parentNode(el), el);
//   view.hostElement = null;
// }

// export function attachView(parentView: ViewData, view: ViewData) {
//   if (!parentView.childViews) {
//     parentView.childViews = [];
//   } else if (parentView.childViews.indexOf(view) !== -1) {
//     throw new Error(`This view is already attached`);
//   }
//   parentView.childViews.push(view);
// }

