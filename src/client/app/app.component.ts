import { Component, ElementRef } from 'mojiito-core';
import { DrawerComponent } from './drawer.component';
import { HeaderComponent } from './header.component';

@Component({
  selector: 'body',
  components: [ HeaderComponent, DrawerComponent ]
})
export class AppComponent {

  constructor(private elementRef: ElementRef) {
    console.log(elementRef.nativeElement);
  }
}
