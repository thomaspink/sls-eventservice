import { EventEmitter, ComponentRef } from '../../core';
import { DialogContainer } from './dialog-container';
import { DialogOverlayRef } from './dialog-overlay';

// Counter for unique dialog ids.
let uniqueId = 0;

export class DialogRef<T> {
  /** The instance of component opened into the dialog. */
  componentInstance: T;

  /** Whether the user is allowed to close the dialog. */
  disableClose = this._containerInstance._config.disableClose;

  /** EventEmitter for notifying the user that the dialog has finished closing. */
  private _afterClosed: EventEmitter<void> = new EventEmitter();

  /** EventEmitter for notifying the user that the dialog has started closing. */
  private _beforeClose: EventEmitter<void> = new EventEmitter();

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

  /**
   * Gets an observable that is notified when the dialog is finished closing.
   */
  afterClosed(): EventEmitter<void> {
    return this._afterClosed;
  }

  /**
   * Gets an observable that is notified when the dialog has started closing.
   */
  beforeClose(): EventEmitter<void> {
    return this._beforeClose;
  }

  close(): void {
    this._beforeClose.emit();
    this._beforeClose.complete();
    this._overlayRef.hide().then(() => {
      this._containerInstance.detachComponent();
      this._overlayRef.detach();
      this._overlayRef.destroy();
      this._afterClosed.emit();
      this._afterClosed.complete();
    });
  }
}
