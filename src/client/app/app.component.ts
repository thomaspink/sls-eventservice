import { Component, OnInit, OnDestroy, ViewChild, ChildListener } from '../core';
import { HeaderComponent } from './components/header.component';
import { DrawerComponent } from './components/drawer.component';
import { DIALOG_COMPONENTS, DIALOG_PROVIDERS, Dialog } from './dialog/dialog';

@Component({
  selector: 'body',
  providers: [DIALOG_PROVIDERS],
  deps: [Dialog],
  components: [HeaderComponent, DrawerComponent]
})
export class AppComponent implements OnInit, OnDestroy {
  private delegates: Function[] = [];

  @ViewChild(DrawerComponent)
  drawer: DrawerComponent;

  constructor(dialog: Dialog) {
  }

  onInit() {
  }

  @ChildListener('header', 'onToggleDrawer')
  onToggleDrawer() {
    if (this.drawer) {
      this.drawer.showDrawer();
    }
  }

  onDestroy() {
  }
}
