import { Injector } from '../di/injector';
import { Renderer } from './renderer';
import { ApplicationRef } from '../application';

export abstract class ViewRef {

  abstract get renderer(): Renderer;
  /**
   * Destroys the view and all of the data structures associated with it.
   */
  abstract destroy(): void;

  abstract get destroyed(): boolean;

  abstract onDestroy(callback: Function): any;
}

export interface InternalViewRef extends ViewRef {
  detachFromAppRef(): void;
  attachToAppRef(appRef: ApplicationRef): void;
}
