import { Component, Provider, ComponentFactoryResolver, Injector, ComponentRef, ApplicationRef } from '../../core';
import { DialogRef } from './dialog-ref';
import { DialogConfig } from './dialog-config';
import { DialogContainer } from './dialog-container';
import { DialogOverlay, DialogOverlayRef } from './dialog-overlay';

export class Dialog {
  private _openDialogs: DialogRef<any>[] = [];

  get openDialogs(): DialogRef<any>[] {
    return this._openDialogs;
  }

  constructor(private _overlay: DialogOverlay) {
  }

  open<T>(component: ComponentType<T>, config?: DialogConfig): DialogRef<T> {
    config = _applyConfigDefaults(config);

    if (config.id && this.getDialogById(config.id)) {
      throw Error(`Dialog with id "${config.id}" exists already. The dialog id must be unique.`);
    }

    const overlayRef = this._createOverlay(config);
    const dialogContainer = this._attachDialogContainer(overlayRef, config);
    const ref = this._attachDialogContent(component, dialogContainer, overlayRef, config);

    overlayRef.show();

    return ref;
  }

  closeAll(): void {
    let i = this.openDialogs.length;
    while (i--) {
      this.openDialogs[i].close();
    }
  }

  /**
   * Finds an open dialog by its id.
   * @param id ID to use when looking up the dialog.
   */
  getDialogById(id: string): DialogRef<any> | undefined {
    return this.openDialogs.find(dialog => dialog.id === id);
  }

  private _createOverlay(config: DialogConfig): DialogOverlayRef {
    return this._overlay.create(config);
  }

  private _attachDialogContainer(overlay: DialogOverlayRef, config: DialogConfig): DialogContainer {
    const el = DialogContainer.render();
    const containerRef = overlay.attach(DialogContainer, el);
    containerRef.instance._config = config;
    return containerRef.instance;
  }

  private _attachDialogContent<T>(
    component: ComponentType<T>,
    dialogContainer: DialogContainer,
    overlayRef: DialogOverlayRef,
    config: DialogConfig): DialogRef<T> {

    // Create a reference to the dialog we're creating in order to give the user a handle
    // to modify and close it.
    const dialogRef = new DialogRef<T>(overlayRef, dialogContainer, config.id);

    // When the dialog backdrop is clicked, we want to close it.
    if (config.hasBackdrop) {
      overlayRef.onBackdropClick.subscribe(() => {
        if (!dialogRef.disableClose) {
          dialogRef.close();
        }
      });
    }

    const injector = this._createInjector<T>(config, dialogRef, dialogContainer);
    const contentRef = dialogContainer.attachComponent(component, injector);
    dialogRef.componentInstance = contentRef.instance;

    this._openDialogs.push(dialogRef);
    dialogRef.afterClosed().subscribe(() => {
      remove(this._openDialogs, dialogRef);
    });

    return dialogRef;
  }

  private _createInjector<T>(
    config: DialogConfig,
    dialogRef: DialogRef<T>,
    dialogContainer: DialogContainer): Injector {

    const providers: Provider[] = [
      { provide: DialogConfig, useValue: config },
      { provide: DialogRef, useValue: dialogRef },
      { provide: DialogContainer, useValue: dialogContainer }
    ];
    return Injector.create(providers);
  }
}

/**
 * Applies default options to the dialog config.
 * @param config Config to be modified.
 * @returns The new configuration object.
 */
function _applyConfigDefaults(config?: DialogConfig): DialogConfig {
  return extendObject(new DialogConfig(), config);
}

export interface ComponentType<T> {
  new(...args: any[]): T;
}

export const DIALOG_PROVIDERS: Provider[] = [
  { provide: DialogOverlay, deps: [ComponentFactoryResolver, Injector] },
  { provide: Dialog, deps: [DialogOverlay] }
];
export const DIALOG_COMPONENTS: ComponentType<any>[] = [
  DialogOverlayRef,
  DialogContainer
];

/**
 * Extends an object with the *enumerable* and *own* properties of one or more source objects,
 * similar to Object.assign.
 *
 * @param dest The object which will have properties copied to it.
 * @param sources The source objects from which properties will be copied.
 */
export function extendObject(dest: any, ...sources: any[]): any {
  if (dest == null) {
    throw TypeError('Cannot convert undefined or null to object');
  }

  for (let source of sources) {
    if (source != null) {
      for (let key in source) {
        if (source.hasOwnProperty(key)) {
          dest[key] = source[key];
        }
      }
    }
  }

  return dest;
}

function remove<T>(list: T[], el: T): boolean {
  const index = list.indexOf(el);
  if (index > -1) {
    list.splice(index, 1);
    return true;
  }
  return false;
}
