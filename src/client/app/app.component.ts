import { Component, OnInit, OnDestroy, ComponentRef, ELEMENT, Renderer } from '../core';
import { listen, findElement } from '../util';
import { HeaderComponent } from './components/header.component';
import { DrawerComponent } from './components/drawer.component';
import { Dialog } from './dialog/dialog';

@Component({
  selector: 'body',
  providers: [{provide: Dialog, deps: []}],
  deps: [ELEMENT, Dialog],
  components: [HeaderComponent, DrawerComponent]
})
export class AppComponent implements OnInit, OnDestroy {
  private drawer: ComponentRef<DrawerComponent> | null;
  private header: ComponentRef<HeaderComponent> | null;
  private delegates: Function[] = [];

  constructor(private element: Element, dialog: Dialog) {
    // const drawer = findElement('side-drawer');
    // this.drawer = getComponentOnElement(DrawerComponent, drawer);
    // const header = findElement('header');
    // this.header = getComponentOnElement(HeaderComponent, header);
  }

  onInit() {
    // this.delegates.push(this.header.instance.onOpenDrawer.subscribe(_ =>
    //   this.drawer.instance.toggleDrawer()).unsubscribe);
  }

  onDestroy() {
    this.delegates.forEach(fn => fn());
  }
}
