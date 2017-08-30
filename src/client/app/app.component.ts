import { Component, OnInit, OnDestroy, ComponentRef, ELEMENT, Renderer, ViewChild } from '../core';
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
  private delegates: Function[] = [];

  @ViewChild(HeaderComponent)
  header: HeaderComponent;

  @ViewChild(DrawerComponent)
  drawer: DrawerComponent;

  constructor(private element: Element, dialog: Dialog) {
    console.log(element, dialog);
  }

  onInit() {
    // this.delegates.push(this.header.instance.onOpenDrawer.subscribe(_ =>
    //   this.drawer.instance.toggleDrawer()).unsubscribe);
    console.log(this.header, this.drawer);
  }

  onDestroy() {
    this.delegates.forEach(fn => fn());
  }
}
