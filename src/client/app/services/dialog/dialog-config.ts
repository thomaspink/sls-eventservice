/** Valid ARIA roles for a dialog element. */
export type DialogRole = 'dialog' | 'alertdialog';

/** Possible overrides for a dialog's position. */
export interface DialogPosition {
  top?: string;
  bottom?: string;
  left?: string;
  right?: string;
}

/**
 * Configuration for opening a modal dialog with the Dialog service.
 */
export class DialogConfig {
    /** ID for the dialog. If omitted, a unique one will be generated. */
    id?: string;

    /** The ARIA role of the dialog element. */
    role?: DialogRole = 'dialog';

    /** Custom class for the overlay pane. */
    panelClass?: string | string[] = '';

    /** Whether the dialog has a backdrop. */
    hasBackdrop?: boolean = true;

    /** Custom class for the backdrop, */
    backdropClass?: string = '';

    /** Whether the user can use escape or clicking outside to close a modal. */
    disableClose?: boolean = false;

    /** Position overrides. */
    position?: DialogPosition;

    /** Data being injected into the child component. */
    data?: any = null;

    /** ID of the element that describes the dialog.  */
    ariaDescribedBy?: string | null = null;
  }
