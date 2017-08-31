import { EventEmitter } from '../../core';
import { DialogContainer } from './dialog-container';
import { DialogOverlayRef } from './dialog-overlay';

// Counter for unique dialog ids.
let uniqueId = 0;

export class DialogRef<T> {
  /** The instance of component opened into the dialog. */
  componentInstance: T;

  /** Whether the user is allowed to close the dialog. */
  disableClose = this._containerInstance._config.disableClose;

  constructor(
    private _overlayRef: DialogOverlayRef,
    private _containerInstance: DialogContainer,
    public readonly id: string = `dialog-${uniqueId++}`) {
  }

  /**
   * Gets an observable that emits when the overlay's backdrop has been clicked.
   */
  backdropClick(): EventEmitter<void> {
    return this._overlayRef.onBackdropClick;
  }

  close(): void {
  }
}
