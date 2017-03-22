import { Component, ElementRef } from 'mojiito-core';
import { DrawerComponent } from './drawer.component';
import { HeaderComponent } from './header.component';
import { Dialog, DIALOG_COMPONENTS, DIALOG_PROVIDERS } from './dialog.service';

@Component({
  selector: 'body',
  components: [HeaderComponent, DrawerComponent, DIALOG_COMPONENTS],
  providers: [DIALOG_PROVIDERS]
})
export class AppComponent {

  constructor(private elementRef: ElementRef) {
    console.log(elementRef.nativeElement);
  }
}
