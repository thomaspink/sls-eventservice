import { Component, ElementRef } from 'mojito';

@Component({
  selector: 'header'
})
export class HeaderComponent {
  constructor(element: ElementRef) {
    console.log('init', element);
  }
}
