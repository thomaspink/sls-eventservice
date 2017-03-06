import { Component, ElementRef } from 'mojiito-core';
import { DrawerComponent } from './drawer.component';
import { HeaderComponent } from './header.component';
import { Overlay, OVERLAY_PROVIDERS, OVERLAY_COMPONENTS } from './overlay.service';

@Component({
  selector: 'body',
  components: [HeaderComponent, DrawerComponent, OVERLAY_COMPONENTS],
  providers: [OVERLAY_PROVIDERS]
})
export class AppComponent {

  constructor(private elementRef: ElementRef) {
    console.log(elementRef.nativeElement);
  }
}
