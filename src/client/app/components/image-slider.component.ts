import { Component, ELEMENT, ChildListener } from '../../core';

@Component({
  selector: 'image-slider',
  deps: [ELEMENT]
})
export class ImageSliderComponent {
  constructor(private _el: Element) {
  }

  @ChildListener('.image-slider-next', 'click')
  next() {
    // Todo @thomas.pink
  }

  @ChildListener('.image-slider-prev', 'click')
  prev() {
    // Todo @thomas.pink
  }

}
