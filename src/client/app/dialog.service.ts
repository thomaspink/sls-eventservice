// import {
//   Injectable, Injector, Component, ComponentRef, ComponentFactoryResolver, ElementRef
// } from 'mojiito-core';

// @Injectable()
// export class Dialog {

//   private _containerRef: ComponentRef<OverlayContainerComponent> = null;
//   private _openDialogRef: ComponentRef<any> = null;

//   constructor(private _resolver: ComponentFactoryResolver, private _injector: Injector) {

//   }

//   get isOpen(): boolean { return !!this._openDialogRef; }

//   open() {
//     if (this.isOpen) {
//       throw new Error('A Dialog is already open. Close it first before opening a new one.');
//     }
//     let container = this._containerRef;
//     if (!container) {
//       container = this._createContainer();
//     }
//   }

//   close() {
//     if (!this.isOpen) {
//       return;
//     }
//   }

//   private _createContainer(): ComponentRef<OverlayContainerComponent> {
//     const el = document.createElement('div');
//     el.className = 'overlay-container';
//     document.body.appendChild(el);
//     const factory = this._resolver.resolveComponentFactory(OverlayContainerComponent);
//     // const ref = factory.create(this._injector, el);
//     // this._containerRef = ref;
//     // return ref;
//     return null;
//   }
// }

// /**
//  * Container that holds all overlays.
//  * It will be attached to the body of the document.
//  *
//  * @export
//  * @class OverlayContainerComponent
//  */
// @Component({
//   selector: 'overlay-container'
// })
// export class OverlayContainerComponent {

//   constructor(private elementRef: ElementRef) { }

// }

// export const DIALOG_PROVIDERS = [ Dialog ];
// export const DIALOG_COMPONENTS = [ OverlayContainerComponent ];
