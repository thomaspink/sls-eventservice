import { Component, ViewChild, ChildListener } from '../core';
import { HeaderComponent } from './components/header.component';
import { DrawerComponent } from './components/drawer.component';
import { ImageSliderComponent } from './components/image-slider.component';
import { DIALOG_COMPONENTS, DIALOG_PROVIDERS, Dialog } from './dialog/dialog';

@Component({
  selector: 'body',
  providers: [DIALOG_PROVIDERS],
  // deps: [Dialog],
  components: [HeaderComponent, DrawerComponent, ImageSliderComponent/*, DIALOG_COMPONENTS*/]
})
export class AppComponent {
  private delegates: Function[] = [];

  @ViewChild(DrawerComponent)
  drawer: DrawerComponent;

  constructor(private dialog: any/* Dialog*/) {
  }

  @ChildListener('header', 'onToggleDrawer')
  onToggleDrawer() {
    // this.dialog.open(ImageSliderComponent);
    if (this.drawer) {
      this.drawer.showDrawer();
    }
  }
}
