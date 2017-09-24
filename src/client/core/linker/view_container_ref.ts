import {Injector} from '../di/injector';
import {ComponentFactory, ComponentRef} from './component_factory';
import {ElementRef} from './element_ref';
// import {TemplateRef} from './template_ref';
import {/*EmbeddedViewRef, */ViewRef} from './view_ref';


/**
 * Represents a container where one or more Views can be attached.
 *
 * The container can contain two kinds of Views. Host Views, created by instantiating a
 * Component via #reateComponent}, and Embedded Views, created by instantiating an
 * TemplateRefEmbedded Template} via #reateEmbeddedView}.
 *
 * The location of the View Container within the containing View is specified by the Anchor
 * `element`. Each View Container can have only one Anchor Element and each Anchor Element can only
 * have a single View Container.
 *
 * Root elements of Views attached to this container become siblings of the Anchor Element in
 * the Rendered View.
 *
 * To access a `ViewContainerRef` of an Element, you can either place a Directive injected
 * with `ViewContainerRef` on the Element, or you obtain it via a ViewChild query.
 * @stable
 */
export abstract class ViewContainerRef {
  /**
   * Anchor element that specifies the location of this container in the containing View.
   * <!-- TODO: rename to anchorElement -->
   */
  abstract get element(): ElementRef;

  abstract get injector(): Injector;

  abstract get parentInjector(): Injector;

  /**
   * Destroys all Views in this container.
   */
  abstract clear(): void;

  /**
   * Returns the ViewRef for the View located in this container at the specified index.
   */
  abstract get(index: number): ViewRef|null;

  /**
   * Returns the number of Views currently attached to this container.
   */
  abstract get length(): number;

  /**
   * Instantiates an Embedded View based on the TemplateRef and inserts it
   * into this container at the specified `index`.
   *
   * If `index` is not specified, the new View will be inserted as the last View in the container.
   *
   * Returns the ViewRef for the newly created View.
   */
  // abstract createEmbeddedView<C>(templateRef: TemplateRef<C>, context?: C, index?: number):
  //     EmbeddedViewRef<C>;

  /**
   * Instantiates a single Component and inserts its Host View into this container at the
   * specified `index`.
   *
   * The component is instantiated using its ComponentFactory which can be
   * obtained via ComponentFactoryResolver}.
   *
   * If `index` is not specified, the new View will be inserted as the last View in the container.
   *
   * You can optionally specify the Injector that will be used as parent for the Component.
   *
   * Returns the ComponentRef of the Host View created for the newly instantiated Component.
   */
  abstract createComponent<C>(
      componentFactory: ComponentFactory<C>, index?: number, injector?: Injector,
      projectableNodes?: any[][]): ComponentRef<C>;

  /**
   * Inserts a View identified by a ViewRef into the container at the specified `index`.
   *
   * If `index` is not specified, the new View will be inserted as the last View in the container.
   *
   * Returns the inserted ViewRef.
   */
  abstract insert(viewRef: ViewRef, index?: number): ViewRef;

  /**
   * Moves a View identified by a ViewRef into the container at the specified `index`.
   *
   * Returns the inserted ViewRef.
   */
  abstract move(viewRef: ViewRef, currentIndex: number): ViewRef;

  /**
   * Returns the index of the View, specified via ViewRef, within the current container or
   * `-1` if this container doesn't contain the View.
   */
  abstract indexOf(viewRef: ViewRef): number;

  /**
   * Destroys a View attached to this container at the specified `index`.
   *
   * If `index` is not specified, the last View in the container will be removed.
   */
  abstract remove(index?: number): void;

  /**
   * Use along with #nsert} to move a View within the current container.
   *
   * If the `index` param is omitted, the last ViewRef is detached.
   */
  abstract detach(index?: number): ViewRef|null;
}
