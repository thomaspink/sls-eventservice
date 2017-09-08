import { Component, ELEMENT } from '../../core';
import { listen, findElement } from '../../util';

@Component({
  selector: 'image-slider',
  deps: [ELEMENT]
})
export class ImageSliderComponent {
  constructor(private _el: Element) {

  }

  render() {

  }
}
