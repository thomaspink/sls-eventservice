import { Component, ELEMENT, HostListener } from '../../core';

@Component({
  selector: '.toggle-drawer',
  deps: [ELEMENT]
})
export class TestComponent {
  constructor(element: Element) {
    console.log(element);
  }

  @HostListener('click', ['$event'])
  onClick($event: any) {
    alert('asdf');
  }
}
