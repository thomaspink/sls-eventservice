import {Component, Provider, ComponentFactoryResolver} from '../../core';

export class Dialog {
  private _openDialogs: DialogRef<any>[] = [];

  get openDialogs(): DialogRef<any>[] {
    return this._openDialogs;
  }

  constructor(resolver: ComponentFactoryResolver) {
    console.log(resolver);
  }

  open<T>(component: ComponentType<T>) {
  }

  closeAll(): void {
    let i = this.openDialogs.length;
    while (i--) {
      this.openDialogs[i].close();
    }
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
  { provide: Dialog, deps: [ComponentFactoryResolver]}
];
export const DIALOG_COMPONENTS: ComponentType<any>[] = [
  DialogContainer
];
