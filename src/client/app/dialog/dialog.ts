import {Component, Provider, ComponentFactoryResolver, Injector, ComponentRef} from '../../core';

export class Dialog {
  private _openDialogs: DialogRef<any>[] = [];
  private _container: ComponentRef<DialogContainer>;

  get openDialogs(): DialogRef<any>[] {
    return this._openDialogs;
  }

  constructor(private _resolver: ComponentFactoryResolver, private _injector: Injector) {
    this._createContainer();
  }

  open<T>(component: ComponentType<T>) {
  }

  closeAll(): void {
    let i = this.openDialogs.length;
    while (i--) {
      this.openDialogs[i].close();
    }
  }

  private _createContainer() {
    if (this._container) {
      throw new Error(`Can not create dialog container component. It already exists`);
    }
    const factory = this._resolver.resolveComponentFactory(DialogContainer);
    const el = document.createElement('dialog-container');
    document.body.appendChild(el);
    const ref = factory.create(el, this._injector);
    this._container = ref;
    return ref;
  }
}


export class DialogRef<T> {
  close(): void {
  }
}

@Component({
  selector: 'dialog-container'
})
export class DialogContainer {

}

export interface ComponentType<T> {
  new (...args: any[]): T;
}

export const DIALOG_PROVIDERS: Provider[] = [
  { provide: Dialog, deps: [ComponentFactoryResolver, Injector]}
];
export const DIALOG_COMPONENTS: ComponentType<any>[] = [
  DialogContainer
];
