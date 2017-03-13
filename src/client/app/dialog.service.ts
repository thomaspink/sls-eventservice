import {
  Injectable, Component, ComponentRef, ComponentFactoryResolver, ElementRef
} from 'mojiito-core';

@Injectable()
export class Dialog {

  private _hostRef: ComponentRef<OverlayContainerComponent>;

  constructor(private _resolver: ComponentFactoryResolver) {

  }

  get isOpen(): boolean { return !!this._hostRef; }

  open() {
    if (this.isOpen) {
      throw new Error('A Dialog is already open. Close it first before opening a new one.');
    }
    const factory = this._resolver.resolveComponentFactory(OverlayContainerComponent);
  }

  close() {
    if (!this.isOpen) {
      return;
    }
  }
}

/**
 * Container that holds all overlays.
 * It will be attached to the body of the document.
 *
 * @export
 * @class OverlayContainerComponent
 */
@Component({
  selector: 'overlay-container'
})
export class OverlayContainerComponent {

  constructor(private elementRef: ElementRef) { }

}

export const DIALOG_PROVIDERS = [ Dialog ];
export const DIALOG_COMPONENTS = [ OverlayContainerComponent ];
