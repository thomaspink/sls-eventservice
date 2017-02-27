import { Component, ElementRef } from 'mojiito-core';
import { platformBrowser } from 'mojiito-platform-browser';

// Start - WEBPACK HOT MODULE RELOAD STUFF
const m = module as any;
if (m.hot) {
  m.hot.accept();
}
// End - WEBPACK HOT MODULE RELOAD STUFF

@Component({
  selector: 'body'
})
export class AppComponent {

  constructor(private elementRef: ElementRef) {
    console.log(elementRef.nativeElement);
  }
}

platformBrowser().bootstrapComponent(AppComponent);
