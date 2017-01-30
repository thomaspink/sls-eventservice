import { Component, ElementRef } from '../../core';

@Component({
  selector: 'header'
})
export class HeaderComponent {
  constructor(element: ElementRef) {
    console.log('init', element);
  }
}
