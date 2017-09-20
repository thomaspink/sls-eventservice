import { Component, ELEMENT, OnInit, OnDestroy, ViewChild } from '../../core';
import { Swiper, SwiperRef } from '../services/swiper';

@Component({
  selector: 'quotes-swiper',
  deps: [ELEMENT, Swiper]
})
export class QuotesSwiperComponent implements OnInit, OnDestroy {

  /** swiper instance */
  private _ref: SwiperRef;

  @ViewChild('.swiper-container', { read: ELEMENT })
  private _container: Element;

  constructor(private elementRef: Element, private _swiper: Swiper) { }

  onInit() {
    if (!this._container)
      throw new Error(`Can not initialize quotes swiper because no container found`);
    if (this._ref)
      throw new Error(`Can not initialize quotes swiper because there is already an instance`);

    this._ref = this._swiper.create(this._container, {
      loop: true,
      autoplay: 10000,
      pagination: '.swiper-pagination',
    });
  }

  onDestroy() {
    if (this._ref)
      this._ref.destroy();
  }
}
