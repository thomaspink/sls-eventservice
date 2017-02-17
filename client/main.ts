import { Component, ElementRef } from 'mojiito-core';
import { platformBrowser } from 'mojiito-platform-browser';

@Component({
  selector: 'body'
})
export class AppComponent {

  constructor(private elementRef: ElementRef) {
    console.log(elementRef.nativeElement);
  }

}

platformBrowser().bootstrapComponent(AppComponent);
