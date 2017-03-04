import { Component, ElementRef, Renderer } from 'mojiito-core';

@Component({
  selector: 'header'
})
export class HeaderComponent {

  constructor(private elementRef: ElementRef, private renderer: Renderer) {
    renderer.selectElements('.toggle-drawer').forEach(btn => {
      renderer.listen(btn, 'click', (event: Event) => {
        console.log('clicked');
      });
    });
  }

}
