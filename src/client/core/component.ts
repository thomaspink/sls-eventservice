import { Type } from './type';
import { querySelectorAll, stringify, genRandom } from '../util';

const COMPONENT_IDS_ATTR_NAME = 'component-ids';
const COMPONENT_IDS_SEPARATOR = ' ';
const factories: ComponentFactory<any>[] = [];
const refs: ComponentRef<any>[] = [];

/**
 * Registers a component class on a specific selector.
 * Every time we find an elmement matching
 * this selector, the component is created.
 * Returns a ComponentFactory for creating components on your own.
 * @param selector The element selector where the component will be created
 * @param component The component class
 * @param shouldUpdate Indicates if the dom should be crawled immediately and create components
 */
export function registerComponent<C>(selector: string, component: Type<C>, shouldUpdate = false): ComponentFactory<C> {
  // First check if component has already been registered
  if (factories && factories.length) {
    factories.forEach(factory => {
      if (factory.selector === selector && factory.componentType === component) {
        throw new Error(`${stringify(component)} has already been registered on this selector "${selector}"`);
      }
    })
  }
  const factory = new ComponentFactory<C>(selector, component);
  factories.push(factory);
  if (shouldUpdate) {
    updateDOM();
  }
  return factory;
}

/**
 * Destroys this component and removes it from the element.
 * @param ref The component reference.
 */
export function destroyComponent<C>(ref: ComponentRef<C>): void {
  const idx = refs.indexOf(ref);
  if (idx === -1) {
    throw new Error(`Cannot destroy component because component reference is not in the registry. Did you already remove the component?`);
  }
  try {
    removeComponentId(ref.location, ref.id);
  } catch (e) {
    throw new Error(`Cannot destroy component because component ID is not set on the element`);
  }
  refs.splice(idx, 1);
  callLifecycleHook(ref.instance, 'onDestroy');
}

export function updateDOM(root: Element = document.body) {
  if (!factories || !factories.length) {
    return;
  }
  factories.forEach(factory => {
    querySelectorAll(factory.selector, root).map((elem: Element) => {
      let skip = false;

      // Check if a component of this type already exists on that element
      for (var i = 0; i < refs.length; i++) {
        const ref = refs[i];
        if (ref.location === elem && ref.componentType === factory.componentType) {
          return null;
        }
      }

      return factory.create(elem);
    });
  });
}

/**
 * This is basically a blueprint on how to create a component.
 * Call create on the factory to create a component of that type.
 */
export class ComponentFactory<C> {
  constructor(public selector: string, public componentType: Type<C>) { }
  create(element: Element): ComponentRef<C> {
    const id = genRandom(32);
    const instance = new this.componentType(element);
    const ref = new ComponentRef(element, instance, id);
    addComponentId(element, id);
    refs.push(ref);
    callLifecycleHook(instance, 'onInit');
    return ref;
  }
}

/**
 * This component reference contains the component instance and the element where
 * it is created on.
 */
export class ComponentRef<C> {
  constructor(private _location: Element, private _component: C,  private _id: string) { }

  get id(): string { return this._id; }
  get location(): Element { return this._location; };
  get instance(): C { return this._component; };
  get componentType(): Type<C> { return <any>this._component.constructor; }

  /**
   * Destroys this component and removes it from the element
   */
  destroy(): void { destroyComponent(this); }
}

function callLifecycleHook(component: any, hook: string, ...args: any[]) {
  const fn = component[hook];
  if (typeof fn === 'function') {
    fn.apply(component, args);
  }
}

/** @internal */
function addComponentId(element: Element, id: string) {
  const ids = getComponentIds(element);
  ids.push(id);
  setComponentIds(element, ids);
}

/** @internal */
function removeComponentId(element: Element, id: string) {
  const ids = getComponentIds(element);
  const idx = ids.indexOf(id);
  if (idx === -1) {
    throw new Error(`Cannot remove component ID from element because ID is not set`);
  }
  ids.splice(idx, 1);
  setComponentIds(element, ids);
}

/** @internal */
function getComponentIds(element: Element): string[] {
  const ids = element.getAttribute(COMPONENT_IDS_ATTR_NAME);
  return ids ? ids.split(COMPONENT_IDS_SEPARATOR) : [];
}

/** @internal */
function setComponentIds(element: Element, ids: string|string[]): void {
  if (Array.isArray(ids)) {
    ids = ids.join(COMPONENT_IDS_SEPARATOR);
  }
  element.setAttribute(COMPONENT_IDS_ATTR_NAME, ids);
}
