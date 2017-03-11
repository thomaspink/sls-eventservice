import {
  Injectable, Component, ComponentRef, ComponentFactoryResolver, ElementRef
} from 'mojiito-core';

@Injectable()
export class Overlay {

  private _hostRef: ComponentRef<OverlayContainerComponent>;

  constructor(private _resolver: ComponentFactoryResolver) {

  }

  get isOpen(): boolean { return !!this._hostRef; }

  open() {
    if (this.isOpen) {
      throw new Error('Overlay is already open. Close it first');
    }
    const factory = this._resolver.resolveComponentFactory(OverlayContainerComponent);
  }

  close() {
    if (!this.isOpen) {
      return;
    }
  }
}

@Component({
  selector: 'overlay-container'
})
export class OverlayContainerComponent {

  constructor(private elementRef: ElementRef) { }

}

export const OVERLAY_PROVIDERS = [ Overlay ];
export const OVERLAY_COMPONENTS = [ OverlayContainerComponent ];
