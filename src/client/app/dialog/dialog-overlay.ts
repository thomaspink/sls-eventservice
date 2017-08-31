import { Component, ChildListener, ViewChild, EventEmitter, Output, ComponentFactoryResolver, ComponentRef, Injector, ELEMENT } from '../../core';
import { DialogContainer } from './dialog-container';
import { ComponentType } from './dialog';
import { DialogConfig } from './dialog-config';


export class DialogOverlay {
  private _container: Element;

  constructor(private _resolver: ComponentFactoryResolver, private _injector: Injector) {
  }

  create(config: DialogConfig): DialogOverlayRef {
    if (!this._container) {
      this._createContainer();
    }
    const el = this._template(config);
    this._container.appendChild(el);
    const factory = this._resolver.resolveComponentFactory(DialogOverlayRef)
    const ref = factory.create(el, this._injector);
    return ref.instance;
  }

  private _template(config: DialogConfig) {
    const wrapper = document.createElement('dialog-overlay-wrapper');
    if (config.hasBackdrop) {
      const backdrop = document.createElement('dialog-overlay-backdrop');
      if (config.backdropClass) {
        backdrop.className = config.backdropClass + 'dialog-overlay-backdrop-showing';
      }
      wrapper.appendChild(backdrop);
    }
    const pane = document.createElement('dialog-overlay-pane');
    wrapper.appendChild(pane);
    return wrapper;
  }

  private _createContainer() {
    this._container = document.createElement('dialog-overlay-container');
    document.body.appendChild(this._container);
  }
}

@Component({
  selector: 'dialog-overlay-wrapper',
  deps: [ComponentFactoryResolver, Injector]
})
export class DialogOverlayRef {

  constructor(private _resolver: ComponentFactoryResolver, private _injector: Injector) { }

  @Output()
  readonly onBackdropClick = new EventEmitter<void>();

  @ViewChild('dialog-overlay-pane', { read: ELEMENT })
  readonly pane: Element;

  @ViewChild('dialog-overlay-backdrop', { read: ELEMENT })
  readonly backdrop: Element;

  attach<T>(compType: ComponentType<T>, element: Element): ComponentRef<T> {
    const factory = this._resolver.resolveComponentFactory(compType);
    const ref = factory.create(element, this._injector);
    this.pane.appendChild(element);
    return ref;
  }

  show() {
    requestAnimationFrame(() => {
      if (this.backdrop) {
        this.backdrop.classList.add('dialog-overlay-backdrop-showing');
      }
      this.pane.classList.add('dialog-overlay-pane-showing');
    });
  }

  hide() {
    requestAnimationFrame(() => {
      if (this.backdrop) {
        this.backdrop.classList.remove('dialog-overlay-backdrop-showing');
      }
      this.pane.classList.remove('dialog-overlay-pane-showing');
    });
  }

  @ChildListener('dialog-overlay-backdrop', 'transitionend')
  private _backdropTransitionEnd() {
  }

  @ChildListener('dialog-overlay-backdrop', 'click')
  private _backdropClicked() {
    this.onBackdropClick.emit();
    this.onBackdropClick.complete();
    return false;
  }
}
