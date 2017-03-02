import { Component, ElementRef } from 'mojiito-core';

@Component({
  selector: 'side-drawer'
})
export class DrawerComponent {

  constructor(private elementRef: ElementRef) {
    console.log(elementRef.nativeElement);
  }

}
