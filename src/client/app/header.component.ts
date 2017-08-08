import { registerComponent, OnInit, OnDestroy } from '../core';
import {listen, findElement} from '../util';

export class HeaderComponent implements OnInit, OnDestroy {
  private _drawerBtn: HTMLButtonElement;
  private _drawer: Element;
  private _delegates: Function[] = [];

  constructor(private element: Element) {
    this._drawerBtn = findElement('.toggle-drawer', element) as HTMLButtonElement;
    this._drawer = findElement('side-drawer');
  }

  onInit() {
    this._delegates.push(listen(this._drawerBtn, 'click', this.openDrawer.bind(this)));
  }

  onDestroy() {
    this._delegates.forEach(fn => fn());
  }

  openDrawer() {
    if(this._drawer.getAttribute('aria-hidden') === 'true') {
      this._drawer.setAttribute('aria-hidden', 'false');
    } else {
      this._drawer.setAttribute('aria-hidden', 'true');
    }
  }
}
registerComponent('header', HeaderComponent);
