import { Component, ViewChild, ChildListener } from '../core';
import { HeaderComponent } from './components/header.component';
import { DrawerComponent } from './components/drawer.component';
import { ImageSliderComponent } from './components/image-slider.component';
import { DIALOG_COMPONENTS, DIALOG_PROVIDERS, Dialog } from './dialog/dialog';

@Component({
  selector: 'body',
  providers: [DIALOG_PROVIDERS],
  deps: [Dialog],
  components: [HeaderComponent, DrawerComponent, ImageSliderComponent, DIALOG_COMPONENTS]
})
export class AppComponent {
  @ViewChild(DrawerComponent)
  drawer: DrawerComponent;

  @ChildListener('header', 'onToggleDrawer')
  onToggleDrawer() {
    if (this.drawer) {
      this.drawer.showDrawer();
    }
  }
}
