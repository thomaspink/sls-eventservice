import { Component } from '../../core';

@Component({
  selector: '.message-box'
})
export class MessageComponent {

  constructor(private element: Element) {
    setTimeout(this.hideElement, 5000);
  }

  hideElement() {
    const el = document.querySelector('.message-box') as HTMLElement;
    el.classList.add('message-box--fadeOut');
    setTimeout(() => {
      el.parentNode.removeChild(el);
    }, 500);
  }

}
