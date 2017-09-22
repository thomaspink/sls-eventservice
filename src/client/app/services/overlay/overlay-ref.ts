import {EventEmitter, EventObservable} from '../../../core';
import {OverlayConfig} from './overlay-config';

/**
 * Reference to an overlay that has been created with the Overlay service.
 * Used to manipulate or dispose of said overlay.
 */
export class OverlayRef /*implements PortalHost*/ {

  private _backdropElement: HTMLElement | null = null;
  private _backdropClick: EventEmitter<any> = new EventEmitter();
  private _attachments = new EventEmitter<void>();
  private _detachments = new EventEmitter<void>();

  constructor(
    // private _portalHost: PortalHost,
    private _pane: HTMLElement,
    private _state: OverlayConfig) {

    // if (_state.scrollStrategy) {
    //   _state.scrollStrategy.attach(this);
    // }
  }

  /** The overlay's HTML element */
  get overlayElement(): HTMLElement {
    return this._pane;
  }

  /**
   * Returns an observable that emits when the backdrop has been clicked.
   */
  backdropClick(): EventObservable<void> {
    return this._backdropClick.asObservable();
  }

  /** Returns an observable that emits when the overlay has been attached. */
  attachments(): EventObservable<void> {
    return this._attachments.asObservable();
  }

  /** Returns an observable that emits when the overlay has been detached. */
  detachments(): EventObservable<void> {
    return this._detachments.asObservable();
  }

  /**
   * Gets the current state config of the overlay.
   */
  getState(): OverlayConfig {
    return this._state;
  }

  /** Updates the size of the overlay based on the overlay config. */
  updateSize() {
    if (this._state.width || this._state.width === 0) {
      this._pane.style.width = formatCssUnit(this._state.width);
    }

    if (this._state.height || this._state.height === 0) {
      this._pane.style.height = formatCssUnit(this._state.height);
    }

    if (this._state.minWidth || this._state.minWidth === 0) {
      this._pane.style.minWidth = formatCssUnit(this._state.minWidth);
    }

    if (this._state.minHeight || this._state.minHeight === 0) {
      this._pane.style.minHeight = formatCssUnit(this._state.minHeight);
    }

    if (this._state.maxWidth || this._state.maxWidth === 0) {
      this._pane.style.maxWidth = formatCssUnit(this._state.maxWidth);
    }

    if (this._state.maxHeight || this._state.maxHeight === 0) {
      this._pane.style.maxHeight = formatCssUnit(this._state.maxHeight);
    }
  }

  /** Toggles the pointer events for the overlay pane element. */
  private _togglePointerEvents(enablePointer: boolean) {
    this._pane.style.pointerEvents = enablePointer ? 'auto' : 'none';
  }

  /** Attaches a backdrop for this overlay. */
  private _attachBackdrop() {
    this._backdropElement = document.createElement('div');
    this._backdropElement.classList.add('cdk-overlay-backdrop');

    if (this._state.backdropClass) {
      this._backdropElement.classList.add(this._state.backdropClass);
    }

    // Insert the backdrop before the pane in the DOM order,
    // in order to handle stacked overlays properly.
    this._pane.parentElement!.insertBefore(this._backdropElement, this._pane);

    // Forward backdrop clicks such that the consumer of the overlay can perform whatever
    // action desired when such a click occurs (usually closing the overlay).
    this._backdropElement.addEventListener('click', () => this._backdropClick.next(null));

    // Add class to fade-in the backdrop after one frame.
    requestAnimationFrame(() => {
      if (this._backdropElement) {
        this._backdropElement.classList.add('cdk-overlay-backdrop-showing');
      }
    });
  }

  /**
   * Updates the stacking order of the element, moving it to the top if necessary.
   * This is required in cases where one overlay was detached, while another one,
   * that should be behind it, was destroyed. The next time both of them are opened,
   * the stacking will be wrong, because the detached element's pane will still be
   * in its original DOM position.
   */
  private _updateStackingOrder() {
    if (this._pane.nextSibling) {
      this._pane.parentNode!.appendChild(this._pane);
    }
  }

  /** Detaches the backdrop (if any) associated with the overlay. */
  detachBackdrop(): void {
    let backdropToDetach = this._backdropElement;

    if (backdropToDetach) {
      let finishDetach = () => {
        // It may not be attached to anything in certain cases (e.g. unit tests).
        if (backdropToDetach && backdropToDetach.parentNode) {
          backdropToDetach.parentNode.removeChild(backdropToDetach);
        }

        // It is possible that a new portal has been attached to this overlay since we started
        // removing the backdrop. If that is the case, only clear the backdrop reference if it
        // is still the same instance that we started to remove.
        if (this._backdropElement == backdropToDetach) {
          this._backdropElement = null;
        }
      };

      backdropToDetach.classList.remove('cdk-overlay-backdrop-showing');

      if (this._state.backdropClass) {
        backdropToDetach.classList.remove(this._state.backdropClass);
      }

      backdropToDetach.addEventListener('transitionend', finishDetach);

      // If the backdrop doesn't have a transition, the `transitionend` event won't fire.
      // In this case we make it unclickable and we try to remove it after a delay.
      backdropToDetach.style.pointerEvents = 'none';

      setTimeout(finishDetach, 500);
    }
  }
}

function formatCssUnit(value: number | string) {
  return typeof value === 'string' ? value as string : `${value}px`;
}
