import { Injector } from '../di/injector';
import { Renderer } from './renderer';

export abstract class ViewRef {
  /**
   * Destroys the view and all of the data structures associated with it.
   */
  abstract destroy(): void;

  abstract get destroyed(): boolean;

  abstract onDestroy(callback: Function): any;
}
