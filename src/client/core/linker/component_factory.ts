import { Type } from '../type';
import { stringify } from '../util';
import { callLifecycleHook } from '../lifecycle_hooks';
import { Provider } from '../di/provider';
import { Injector, StaticInjector } from '../di/injector';
import { InjectionToken } from '../di/injection_token';
import { Component } from '../metadata/components';
import { ViewRef } from '../linker/view_ref';

// import { genRandom } from '../../util';

// const COMPONENT_IDS_ATTR_NAME = 'component-ids';
// const COMPONENT_IDS_SEPARATOR = ' ';
// const refs: ComponentRef<any>[] = [];

/**
 * Registers a component class on a specific selector.
 * Every time we find an elmement matching
 * this selector, the component is created.
 * Returns a ComponentFactory for creating components on your own.
 * @param selector The element selector where the component will be created
 * @param component The component class
 */
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

/**
 * Destroys this component and removes it from the element.
 * @param ref The component reference.
 */
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
// function setComponentIds(element: Element, ids: string | string[]): void {
//   if (Array.isArray(ids)) {
//     ids = ids.join(COMPONENT_IDS_SEPARATOR);
//   }
//   element.setAttribute(COMPONENT_IDS_ATTR_NAME, ids);
// }



/**
 * Represents an instance of a Component created via a ComponentFactory.
 *
 * `ComponentRef` provides access to the Component Instance as well other objects related to this
 * Component Instance and allows you to destroy the Component Instance via the destroy}
 * method.
 * @stable
 */
export abstract class ComponentRef<C> {
  /**
   * Location of the Host Element of this Component Instance.
   */
  abstract get location(): Element;

  /**
   * The injector on which the component instance exists.
   */
  abstract get injector(): Injector;

  /**
   * The instance of the Component.
   */
  abstract get instance(): C;

  /**
   * The ViewRef of the Host View of this Component instance.
   */
  abstract get hostView(): ViewRef;

  /**
   * The ChangeDetectorRef of the Component instance.
   */
  // abstract get changeDetectorRef(): ChangeDetectorRef;

  /**
   * The component type.
   */
  abstract get componentType(): Type<any>;

  /**
   * Destroys the component instance and all of the data structures associated with it.
   */
  abstract destroy(): void;

  /**
   * Allows to register a callback that will be called when the component is destroyed.
   */
  abstract onDestroy(callback: Function): void;
}

/**
 * @stable
 */
export abstract class ComponentFactory<C> {
  abstract get selector(): string;
  abstract get componentType(): Type<any>;
  /**
   * the inputs of the component.
   */
  // abstract get inputs(): { propName: string, templateName: string }[];
  /**
   * the outputs of the component.
   */
  // abstract get outputs(): { propName: string, templateName: string }[];

  /**
   * Creates a new component.
   */
  abstract create(element?: any|null, injector?: Injector|null,
    parent?: ComponentRef<any>|null): ComponentRef<C>;
}
