import { Component, ElementRef } from 'mojiito-core';
import { platformBrowser } from 'mojiito-platform-browser';
import { AppComponent } from './app/app.component';

// Init Mojiito
platformBrowser().bootstrapComponent(AppComponent);

// Start - WEBPACK HOT MODULE RELOAD STUFF
const m = module as any;
if (m.hot) {
  m.hot.accept();
}
// End - WEBPACK HOT MODULE RELOAD STUFF
