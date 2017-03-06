import { Component, ElementRef } from 'mojiito-core';
import { Overlay } from './overlay.service';

@Component({
  selector: 'side-drawer'
})
export class DrawerComponent {

  constructor(private _overlay: Overlay) {
    this._overlay.open();
  }

}
