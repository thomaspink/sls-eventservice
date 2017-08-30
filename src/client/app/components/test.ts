import { Component, ELEMENT, HostListener, Output, EventEmitter } from '../../core';

@Component({
  selector: '.toggle-drawer',
  deps: [ELEMENT]
})
export class TestComponent {

  @Output()
  clickEmitter = new EventEmitter();

  constructor(element: Element) {
    console.log(element);
  }

  @HostListener('click', ['$event'])
  onClick($event: any) {
    this.clickEmitter.emit({a: 1, b: 2});
  }
}
