import { Component, ViewChild, ChildListener } from '../core';
import { HeaderComponent } from './components/header.component';
import { DrawerComponent } from './components/drawer.component';
import { QuotesSwiperComponent } from './components/quotes-swiper.component';
import { ImageSliderComponent } from './components/image-slider.component';
import { DIALOG_COMPONENTS, DIALOG_PROVIDERS, Dialog } from './services/dialog/dialog';
import { SWIPER_PROVIDERS } from './services/swiper';
import { MessageComponent } from './components/message.component';

@Component({
  selector: 'body',
  providers: [DIALOG_PROVIDERS, SWIPER_PROVIDERS],
  deps: [Dialog],
  components: [
    HeaderComponent,
    MessageComponent,
    DrawerComponent,
    QuotesSwiperComponent,
    ImageSliderComponent,
    DIALOG_COMPONENTS
  ]
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
