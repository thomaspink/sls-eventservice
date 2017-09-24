import {Type} from '../type';
import {Injector} from '../di/injector';
import {ViewRef} from '../linker/view_ref';
import {ElementRef} from '../linker/element_ref';

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
  abstract get location(): ElementRef;

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
  abstract create(injector: Injector, rootSelectorOrNode?: string | any): ComponentRef<C>;
}
