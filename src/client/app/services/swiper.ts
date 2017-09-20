import { InjectionToken, Provider, EventEmitter } from '../../core';

/**
 * Service for creating idangerous swiper.
 *
 * Example:
 * ```
 * @Component({
 *   selector: 'quotes-swiper',
 *   deps: [Swiper]
 * })
 * class SwiperComponent implements OnInit, OnDestroy {
 *
 *   private _ref: SwiperRef;
 *
 *   @ViewChild('.swiper-container', { read: ELEMENT })
 *   private _container: Element;
 *
 *   constructor(private _swiper: Swiper) { }
 *
 *   onInit() {
 *
 *     this._ref = this._swiper.create(this._container, {
 *       // swiper options http://idangero.us/swiper/api/
 *       loop: true,
 *     });
 *   }
 *
 *   onDestroy() {
 *     if (this._ref)
 *       this._ref.destroy();
 *   }
 * }
 * ```
 */
export class Swiper {

  private _refs: SwiperRef[] = [];
  private _afterCreation = new EventEmitter<SwiperRef>();
  private _afterAllDestroyed = new EventEmitter<void>();

  constructor(private _lib: any) { }

  /** Stream that emits when a swiper has been created. */
  get afterCreation() { return this._afterCreation; }

  /** Stream that emits when active all swipers have been destroyed. */
  get afterAllDestroyed() { return this._afterAllDestroyed; }

  /**
   * Creates a new idangerous swiper and return the reference.
   * You have to provide an element and optional some options.
   * ATTENTION: If you provide a selector, swiper will look for the
   * elements in the whole DOM!
   * @param elementOrSelector The swiper element or a selector to it.
   * @param options Native swiper options http://idangero.us/swiper/api/
   */
  create(elementOrSelector: Element|string, options = {}): SwiperRef {
    const instance = this._lib(elementOrSelector, options);
    const ref = new SwiperRef(instance);
    this._refs.push(ref);
    this._afterCreation.next(ref);
    return ref;
  }

  /** Destroy all swiper instances at once */
  destroyAll() {
    this._refs.forEach(ref => ref.destroy());
    this._refs = [];
  }
}

/**
 * Reference of a Swiper instance
 */
export class SwiperRef {

  /** Get the native idangerous swiper instance */
  get nativeInstance() { return this._nativeInstance; }

  constructor (private _nativeInstance: any) { }

  /** Destroys the swiper instance and removes event listeners */
  destroy() { this._nativeInstance.destroy(/* deleteInstance*/true, /*cleanupStyles*/true); }

  /** Run transition to next slide */
  slideNext() { this._nativeInstance.slideNext(); }

  /** Run transition to previous slide */
  slidePrev() { this._nativeInstance.slidePrev(); }

  /** Run transition to the slide with index number equal to 'index' parameter */
  slideTo(index: number) { this._nativeInstance.slideTo(index); }
}

export const SwiperLib = new InjectionToken('SwiperLib');

export function SwiperLibDefaultFactory() {
  const lib = (window as any).Swiper;
  if (!lib)
    throw new Error(`Swiper library not found!`);
  return lib;
}

export const SWIPER_PROVIDERS: Provider[] = [
  { provide: SwiperLib, useFactory: SwiperLibDefaultFactory, deps: [] },
  { provide: Swiper, deps: [SwiperLib] }
];
