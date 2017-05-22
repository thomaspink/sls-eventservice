import { Component, ElementRef } from 'mojiito-core';

@Component({
  selector: 'quotes-swiper'
})
export class QuotesSwiperComponent {

  constructor(private elementRef: ElementRef) {
    const container = elementRef.nativeElement.querySelector('.swiper-container');
    const global = window as any;
    if (!global.Swiper || !container) {
      return;
    }
    const swiper = new global.Swiper(container, {
      loop: true,
      autoplay: 10000
    });
  }
}
