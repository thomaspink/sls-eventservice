import {Component, OnInit, OnDestroy, ChildListener, ViewChild} from '../../core';
import {Swiper, SwiperRef} from '../services/swiper';

@Component({
  selector: 'image-slider',
  deps: [Swiper]
})
export class ImageSliderComponent implements OnInit, OnDestroy {

  private _swiperRef: SwiperRef;

  @ViewChild('.image-slider-container')
  private _container: Element;

  constructor(private _swiper: Swiper) { }

  onInit() {
    if (this._swiperRef)
      throw new Error(`Can not initialize image slider because there is already a swiper instance`);

    this._swiperRef = this._swiper.create(this._container, {
      loop: true,
    });
  }

  onDestroy() {
    if (this._swiperRef)
      this._swiperRef.destroy();
  }

  @ChildListener('.image-slider-next', 'click')
  next() { this._swiperRef.slideNext(); }

  @ChildListener('.image-slider-prev', 'click')
  prev() { this._swiperRef.slidePrev(); }

}
