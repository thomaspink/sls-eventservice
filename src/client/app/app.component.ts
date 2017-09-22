import { Component, ViewChild, ChildListener, Optional, SkipSelf } from '../core';
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
  deps: [ [new Optional(), new SkipSelf(), Dialog]],
  components: [HeaderComponent, DrawerComponent, ImageSliderComponent/*, DIALOG_COMPONENTS*/]
>>>>>>> 3499c6ed2259da4ad42557100863a296ad1758d8
})
export class AppComponent {

  @ViewChild(DrawerComponent)
  drawer: DrawerComponent;

<<<<<<< HEAD
  @ChildListener('header', 'onToggleDrawer')
  onToggleDrawer() {
=======
  constructor(private dialog?: any/* Dialog*/) {
  }

  @ChildListener('header', 'onToggleDrawer')
  onToggleDrawer() {
    // this.dialog.open(ImageSliderComponent);
>>>>>>> 3499c6ed2259da4ad42557100863a296ad1758d8
    if (this.drawer) {
      this.drawer.showDrawer();
    }
  }
}
