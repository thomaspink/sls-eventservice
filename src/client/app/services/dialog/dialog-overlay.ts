import {
  Component, ChildListener, ViewChild, EventEmitter, Output, ComponentFactoryResolver,
  ComponentRef, Injector, ELEMENT
} from '../../../core';
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
    // this._container.appendChild(el);
    // const factory = this._resolver.resolveComponentFactory(DialogOverlayRef)
    // const ref = factory.create(el, this._injector);
    // return ref.instance;
    return null;
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
  deps: [ComponentFactoryResolver, Injector, ComponentRef],
  template: `
    <div disabled><!-- some comment -->
      <span class="test"></span>
    </div>
    <section>
      <input type="text">
      <input type="password"/>
      <textarea>some text</textarea>
    </section>
  `
})
export class DialogOverlayRef {

  private _hidePromiseResolve: () => void = null;
  private _isVisible = false;
  private _componentRef: ComponentRef<any> = null;

  constructor(private _resolver: ComponentFactoryResolver, private _injector: Injector,
    private _ref: ComponentRef<DialogOverlayRef>) { }

  @Output()
  readonly onBackdropClick = new EventEmitter<void>();

  @ViewChild('dialog-overlay-pane', { read: ELEMENT })
  readonly pane: Element;

  @ViewChild('dialog-overlay-backdrop', { read: ELEMENT })
  readonly backdrop: Element;

  attach<T>(compType: ComponentType<T>, element: Element): ComponentRef<T> {
<<<<<<< HEAD:src/client/app/services/dialog/dialog-overlay.ts
    if (this._componentRef) {
      throw new Error(
        `Can not attach component to overlay, because there is already a component attached!`);
=======
    if (this._componentRef)  {
      throw new Error(`Can not attach component to overlay, because there is already a component attached!`);
>>>>>>> 3499c6ed2259da4ad42557100863a296ad1758d8:src/client/app/dialog/dialog-overlay.ts
    }
    // this.pane.appendChild(element);
    // const factory = this._resolver.resolveComponentFactory(compType);
    // const ref = factory.create(element, this._injector);
    // this._componentRef = ref;
    // return ref;
    return null;
  }

  detach() {
    if (!this._componentRef)  {
      throw new Error(`Can not detach component from overlay, because nothing is attached!`);
    }
    this._componentRef.destroy();
    this._componentRef = null;
  }

  destroy() {
    // TODO: Maybe don't self destroy
    this._ref.destroy();
  }

  show() {
    this._isVisible = true;
    requestAnimationFrame(() => {
      if (this.backdrop) {
        this.backdrop.classList.add('dialog-overlay-backdrop-showing');
      }
      this.pane.classList.add('dialog-overlay-pane-showing');
    });
  }

  hide(): Promise<void> {
    requestAnimationFrame(() => {
      if (this.backdrop) {
        this.backdrop.classList.remove('dialog-overlay-backdrop-showing');
      }
      this.pane.classList.remove('dialog-overlay-pane-showing');
    });
    if (!this._isVisible) {
      this._isVisible = false;
      this._hidePromiseResolve = null;
      return Promise.resolve();
    }
    this._isVisible = false;
    return new Promise(resolve => this._hidePromiseResolve = resolve);
  }

  @ChildListener('dialog-overlay-backdrop', 'transitionend')
  private _backdropTransitionEnd() {
    if (this._hidePromiseResolve)  {
      console.log('trans end');
      this._hidePromiseResolve();
      this._hidePromiseResolve = null;
    }
  }

  @ChildListener('dialog-overlay-backdrop', 'click')
  private _backdropClicked() {
    console.log('backdrop clicked');
    this.onBackdropClick.emit();
    this.onBackdropClick.complete();
    return false;
  }
}
