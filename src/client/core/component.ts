// import { findElements, stringify, genRandom } from '../util';
// import { Type } from './type';
// import { Provider } from './di/provider';
// import { Injector, StaticInjector } from './di/injector';
// import { InjectionToken } from './di/injection_token';
// import { Component } from './metadata/components';

// const COMPONENT_IDS_ATTR_NAME = 'component-ids';
// const COMPONENT_IDS_SEPARATOR = ' ';
// const factories: ComponentFactory<any>[] = [];
// const refs: ComponentRef<any>[] = [];

// type TokenType = Type<any> | InjectionToken<any>;

// /**
//  * Registers a component class on a specific selector.
//  * Every time we find an elmement matching
//  * this selector, the component is created.
//  * Returns a ComponentFactory for creating components on your own.
//  * @param selector The element selector where the component will be created
//  * @param component The component class
//  */
// export function registerComponent<C>(metadata: Component<C>): ComponentFactory<C> {
//   const selector = metadata.selector;
//   const component = metadata.type;
//   // First check if component has already been registered
//   if (factories && factories.length) {
//     factories.forEach(factory => {
//       if (factory.selector === selector && factory.componentType === component) {
//         // tslint:disable-next-line:max-line-length
//         throw new Error(`${stringify(component)} has already been registered on this selector "${selector}"`);
//       }
//     });
//   }
//   const factory = new ComponentFactory<C>(selector, component, metadata.providers, metadata.deps);
//   factories.push(factory);
//   return factory;
// }

// /**
//  * Destroys this component and removes it from the element.
//  * @param ref The component reference.
//  */
// export function destroyComponent<C>(ref: ComponentRef<C>): void {
//   const idx = refs.indexOf(ref);
//   if (idx === -1) {
//     // tslint:disable-next-line:max-line-length
//     throw new Error(`Cannot destroy component because component reference is not in the registry. Did you already remove the component?`);
//   }
//   try {
//     removeComponentId(ref.location, ref.id);
//   } catch (e) {
//     throw new Error(`Cannot destroy component because component ID is not set on the element`);
//   }
//   refs.splice(idx, 1);
//   callLifecycleHook(ref.instance, 'onDestroy');
// }

// export function updateDOM(root: Element|Document = document) {
//   if (!factories || !factories.length) {
//     return;
//   }
//   factories.forEach(factory => {
//     findElements(factory.selector, root).map((elem: Element) => {
//       // Check if a component of this type already exists on that element
//       return getComponentOnElement(factory.componentType, elem) ? null : factory.create(elem);
//     });
//   });
// }

// export function getComponentsOnElement(element: Element): ComponentRef<any>[] {
//   return refs.length && refs.filter(ref => ref.location === element ) || [];
// }

// export function getComponentOnElement<C>(component: Type<C>, element: Element):
//   ComponentRef<C>|null {
//   if (refs.length) {
//     for (var i = 0; i < refs.length; i++) {
//       const ref = refs[i];
//       if (ref.location === element && ref.componentType === component) {
//         return ref;
//       }
//     }
//   }
//   return null;
// }



// /**
//  * This component reference contains the component instance and the element where
//  * it is created on.
//  */
// export class ComponentRef<C> {
//   constructor(private _location: Element, private _component: C,  private _id: string,
//     private _injector: Injector) { }

//   get id(): string { return this._id; }
//   get location(): Element { return this._location; };
//   get instance(): C { return this._component; };
//   get injector(): Injector { return this._injector; };
//   get componentType(): Type<C> { return <any>this._component.constructor; }

//   /**
//    * Destroys this component and removes it from the element
//    */
//   destroy(): void { destroyComponent(this); }
// }

// export const ELEMENT = new InjectionToken('ComponentElement');

// export class ComponentInjector extends StaticInjector {
//   constructor(private element: any, providers?: Provider[], parent?: Injector) {
//     super(providers, parent);
//   }

//   get<T>(token: any, notFoundValue?: any): T {
//     if (token === ELEMENT) {
//       return this.element;
//     }
//     return super.get(token, notFoundValue);
//   }
// }

// function callLifecycleHook(component: any, hook: string, ...args: any[]) {
//   const fn = component[hook];
//   if (typeof fn === 'function') {
//     fn.apply(component, args);
//   }
// }

// /** @internal */
// function addComponentId(element: Element, id: string) {
//   const ids = getComponentIds(element);
//   ids.push(id);
//   setComponentIds(element, ids);
// }

// /** @internal */
// function removeComponentId(element: Element, id: string) {
//   const ids = getComponentIds(element);
//   const idx = ids.indexOf(id);
//   if (idx === -1) {
//     throw new Error(`Cannot remove component ID from element because ID is not set`);
//   }
//   ids.splice(idx, 1);
//   setComponentIds(element, ids);
// }

// /** @internal */
// function getComponentIds(element: Element): string[] {
//   const ids = element.getAttribute(COMPONENT_IDS_ATTR_NAME);
//   return ids ? ids.split(COMPONENT_IDS_SEPARATOR) : [];
// }

// /** @internal */
// function setComponentIds(element: Element, ids: string|string[]): void {
//   if (Array.isArray(ids)) {
//     ids = ids.join(COMPONENT_IDS_SEPARATOR);
//   }
//   element.setAttribute(COMPONENT_IDS_ATTR_NAME, ids);
// }
