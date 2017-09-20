import { Component, ELEMENT, OnInit, OnDestroy, ViewChild } from '../../core';

@Component({
  selector: 'quotes-swiper',
  deps: [ELEMENT]
})
export class QuotesSwiperComponent implements OnInit, OnDestroy {

  /** swiper instance */
  private _ref: any;

  @ViewChild('.swiper-container', { read: ELEMENT })
  private _container: Element;

  constructor(private elementRef: Element) { }

  onInit() {
    if (!this._container)
      throw new Error(`Can not initialize quotes swiper because no container found`);
    if (this._ref)
      throw new Error(`Can not initialize quotes swiper because there is already an instance`);

    const container = this._container;
    const global = window as any;
    if (!global.Swiper || !container) {
      return;
    }
    this._ref = new global.Swiper(container, {
      loop: true,
      autoplay: 10000,
      pagination: '.swiper-pagination',
    });
  }

  onDestroy() {
    if (this._ref)
      this._ref.destroy(/* deleteInstance*/true, /*cleanupStyles*/true);
  }
}
