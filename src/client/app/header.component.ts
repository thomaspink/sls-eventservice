import { registerComponent, OnInit, OnDestroy } from '../core';
import {listen, findElement} from '../util';

export class HeaderComponent implements OnInit, OnDestroy {
  private _drawerBtn: HTMLButtonElement;
  private _delegates: Function[] = [];

  constructor(private element: Element) {
    this._drawerBtn = findElement('.toggle-drawer', element) as HTMLButtonElement;
  }

  onInit() {
    this._delegates.push(listen(this._drawerBtn, 'click', this.openDrawer.bind(this)));
  }

  onDestroy() {
    this._delegates.forEach(fn => fn());
  }

  openDrawer() {
    alert("dsaf");

  }
}
registerComponent('header', HeaderComponent);
