import { Component, ComponentFactoryResolver, Injector, ELEMENT, ComponentRef } from '../../core';
import { DialogConfig } from './dialog-config';
import { ComponentType } from './dialog';

/**
 * Internal component that wraps user-provided dialog content.
 */
@Component({
  selector: 'dialog-container',
  deps: [ComponentFactoryResolver, ELEMENT]
})
export class DialogContainer {

  _config: DialogConfig;
  _ref: ComponentRef<any> = null;

  constructor(private _resolver: ComponentFactoryResolver, private _el: Element) {

  }

  attachComponent<T>(component: ComponentType<T>, injector: Injector): ComponentRef<T> {
    if (this._ref) {
      throw new Error(`Can not attach component to dialog container, because there is already a component attached!`);
    }

    const factory = this._resolver.resolveComponentFactory(component);

    // TODO: Change to support class names, ids, ...
    const name = factory.selector;
    const el = document.createElement(name);
    this._el.appendChild(el);

    const ref = factory.create(el, injector);
    this._ref = ref;
    return ref;
  }

  detachComponent() {
    if (!this._ref) {
      throw new Error(`Can not detach component from dialog container, because nothing is attached!`);
    }
    this._ref.destroy();
    this._ref = null;
  }

  static render() {
    return document.createElement('dialog-container');
  }
}
