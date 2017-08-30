import { Component, OnInit, OnDestroy, EventEmitter, ELEMENT, ChildListener } from '../../core';
import { listen, findElement } from '../../util';
import { TestComponent } from './test';

@Component({
  selector: 'header',
  deps: [ELEMENT],
  components: [TestComponent]
})
export class HeaderComponent implements OnInit, OnDestroy {
  public onOpenDrawer = new EventEmitter();

  private _drawerBtn: HTMLButtonElement;
  private _drawer: Element;
  private _delegates: Function[] = [];

  constructor(private element: Element) {
    // this._drawerBtn = findElement('.toggle-drawer', element) as HTMLButtonElement;
    // this._drawer = findElement('side-drawer');
    console.log(element);
  }

  onInit() {
    // this._delegates.push(listen(this._drawerBtn, 'click', this.openDrawer.bind(this)));
  }

  @ChildListener('.brand', 'click')
  test(event: MouseEvent) {
    console.log('sadf', event);
    return false;
  }

  @ChildListener('.toggle-drawer', 'clickEmitter', ['$event.a', '$event.b'])
  testClicked(a: number, b: number) {
    console.log('testClicked', arguments);
  }

  onDestroy() {
    this._delegates.forEach(fn => fn());
  }

  openDrawer() {
    // this.onOpenDrawer.emit();
  }
}
