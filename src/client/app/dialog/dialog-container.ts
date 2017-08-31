import { Component, ComponentFactoryResolver, Injector, ELEMENT, ComponentRef } from '../../core';
import { DialogConfig } from './dialog-config';
import { ComponentType } from './dialog';

/**
 * Internal component that wraps user-provided dialog content.
 */
@Component({
  selector: 'dialog-container',
  deps: [ComponentFactoryResolver, Injector, ELEMENT]
})
export class DialogContainer {

  _config: DialogConfig;

  constructor(private _resolver: ComponentFactoryResolver, private _injector: Injector, private _el: Element) {

  }

  attachComponent<T>(component: ComponentType<T>): ComponentRef<T> {
    const factory = this._resolver.resolveComponentFactory(component);

    // TODO: Change to support class names, ids, ...
    const name = factory.selector;
    const el = document.createElement(name);
    this._el.appendChild(el);

    const ref = factory.create(el, this._injector);
    return ref;
  }

  static render() {
    return document.createElement('dialog-container');
  }
}
