import { Component, ElementRef } from 'mojiito-core';
import { DrawerComponent } from './drawer.component';

@Component({
  selector: 'body',
  components: [ DrawerComponent ]
})
export class AppComponent {

  constructor(private elementRef: ElementRef) {
    console.log(elementRef.nativeElement);
  }
}
