import { Component, ViewChild, ChildListener } from '../core';
import { HeaderComponent } from './components/header.component';
import { DrawerComponent } from './components/drawer.component';
import { QuotesSwiperComponent } from './components/quotes-swiper.component';
import { ImageSliderComponent } from './components/image-slider.component';
import { DIALOG_COMPONENTS, DIALOG_PROVIDERS, Dialog } from './services/dialog/dialog';
import { SWIPER_PROVIDERS } from './services/swiper';

@Component({
  selector: 'body',
<<<<<<< HEAD
  providers: [DIALOG_PROVIDERS, SWIPER_PROVIDERS],
  deps: [Dialog],
  components: [
    HeaderComponent,
    DrawerComponent,
    QuotesSwiperComponent,
    ImageSliderComponent,
    DIALOG_COMPONENTS
  ]
=======
  providers: [DIALOG_PROVIDERS],
  // deps: [Dialog],
  components: [HeaderComponent, DrawerComponent, ImageSliderComponent/*, DIALOG_COMPONENTS*/]
>>>>>>> dba3ac1... wip
})
export class AppComponent {
  @ViewChild(DrawerComponent)
  drawer: DrawerComponent;

<<<<<<< HEAD
  @ChildListener('header', 'onToggleDrawer')
  onToggleDrawer() {
=======
  constructor(private dialog: any/* Dialog*/) {
  }

  @ChildListener('header', 'onToggleDrawer')
  onToggleDrawer() {
    // this.dialog.open(ImageSliderComponent);
>>>>>>> dba3ac1... wip
    if (this.drawer) {
      this.drawer.showDrawer();
    }
  }
}
