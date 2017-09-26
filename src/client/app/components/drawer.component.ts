import {
  Component, ELEMENT, HostListener, ChildListener, ViewChild, ElementRef
} from '../../core';


// tslint:disable:no-unused-variable
@Component({
  selector: 'side-drawer',
  deps: [ElementRef]
})
export class DrawerComponent {
  private startX = 0;
  private currentX = 0;
  private touchingDrawer = false;
  private trashhold = 0.5;
  private isAnimatable = false;

  // The container element (the white panel)
  @ViewChild('.side-drawer__nav', {read: ELEMENT})
  private container: HTMLElement;

  // The close button elment
  @ViewChild('.side-drawer__close', {read: ELEMENT})
  private closeBtn: HTMLElement;

  private element: Element;

  constructor(ref: ElementRef) {
    this.element = ref.nativeElement;
    this.update = this.update.bind(this);
    this.enableAnimatable();
  }

  /** Either shows or hides the drawer. */
  toggleDrawer() {
    if (this.isDrawerVisible) {
      this.hideDrawer();
    } else {
      this.showDrawer();
    }
  }

  /** Checks if drawer is currently visible */
  get isDrawerVisible() {
    return this.element.getAttribute('aria-hidden') === 'false';
  }

  /** Shows the drawer and triggers the showing animation. */
  showDrawer() {
    this.enableAnimatable();
    requestAnimationFrame(() => {
      this.element.setAttribute('aria-hidden', 'false');
      this.disableScroll();
    });
  }

  /**
   * Listens for the click event on the close button.
   * Hides the drawer and triggers the hiding animation.
   */
  @ChildListener('.side-drawer__close', 'click')
  hideDrawer() {
    console.log('hideDrawer');
    this.enableAnimatable();
    requestAnimationFrame(() => {
      this.element.setAttribute('aria-hidden', 'true');
      this.enableScroll();
    });
  }

  /**
   * Listens on the host element itself for a click and the closes
   * it if the click target is the backdrop
   */
  @HostListener('click', ['$event'])
  selfClicked(evt: MouseEvent) {
    if (evt.target === this.element)
      this.hideDrawer();
  }

  /**
   * Listens for touchstart events and reacts to it.
   * Sets up and starts the finger drag of the drawer.
   * position on the screen.
   * @param evt TouchEvent
   */
  @HostListener('touchstart', ['$event'])
  private onTouchStart(evt: TouchEvent) {

    // Only do stuff if the drawer is visible and the touch target
    // is not the backdrop or the close button
    if (this.isDrawerVisible && evt.target !== this.element &&
      evt.target !== this.closeBtn) {
      this.disableAnimatable();

      this.startX = evt.touches[0].pageX;
      this.currentX = this.startX;

      // set the touchingDrawer property to true so
      // we know we are currently in the drag mode
      this.touchingDrawer = true;

      // Call update to trigger reflecting the changes to the element
      this.update();
    }
  }

  /**
   * Listens for touchmove events and reacts to it.
   * Moves the drawer accordingly to the finger
   * position on the screen.
   * @param evt TouchEvent
   */
  @HostListener('touchmove', ['$event'])
  private onTouchMove(evt: TouchEvent) {
    if (!this.touchingDrawer) {
      return;
    }
    this.currentX = evt.touches[0].pageX;
    const translateX = Math.max(0, this.currentX - this.startX);

    if (translateX > 290 * this.trashhold) {
      return false;
    }
  }

  /**
   * Listens for touchend events and reacts to it.
   * It either finishes the drag of the drawer or
   * checks if the user has clicked on elements
   * that close it.
   * @param evt TouchEvent
   */
  @HostListener('touchend', ['$event'])
  private onTouchEnd(evt: TouchEvent) {

    // Check if we are touching the drawer
    // only in this case we finish the drag
    // otherwise we ned to check if the user
    // has clicked specific elments (see below)
    if (!this.touchingDrawer) {

      // if target is the element itself or the close button and not the container
      // we know the user touched outside of the drawer (on the backdrop) or the
      // close button. In this case we do the same as if the use has clicked on this
      // elements and close the drawer
      if (evt.target === this.element || evt.target === this.closeBtn) {
        this.hideDrawer();
      }
      return false;
    }


    this.touchingDrawer = false;

    const translateX = Math.max(0, this.currentX - this.startX);
    this.container.style.transform = '';

    if (translateX > 290 * this.trashhold) {
      this.hideDrawer();
    } else {
      this.showDrawer();
    }
  }

  /**
   * Update is an optimized method for reflecting the values to
   * the element itself. If update is called once (on touchstart)
   * the method will call itself on every animationframe until
   * the drag has been finished (on touchend).
   * The Benefit of this is that we only translate the elements
   * once per animationframe.
   */
  private update() {
    requestAnimationFrame(() => {
      if (!this.touchingDrawer) {
        return;
      }
      const translateX = Math.max(0, this.currentX - this.startX);
      this.container.style.transform = `translateX(${translateX}px)`;
      this.update();
    });
  }

  /**
   * Listens for the transitionend event so we know
   * when the show or hide animation has ended and
   * we can reset stuff (we basically are again just
   * disabling animation).
   */
  @HostListener('transitionend')
  private onTransitionEnd() {
    // Do stuff only when transition end has been
    // called in animation mode
    if (!this.isAnimatable)
      return;

    this.disableAnimatable();
  }

  @ChildListener('.side-drawer__nav', 'click', ['$event'])
  private blockClicks(evt: MouseEvent) {
    evt.stopPropagation();
  }

  private disableScroll() {
    document.body.parentElement.classList.add('noscroll');
  }

  private enableScroll() {
    document.body.parentElement.classList.remove('noscroll');
  }

  private enableAnimatable() {
    this.element.classList.add('side-drawer--animatable');
    this.isAnimatable = true;
  }

  private disableAnimatable() {
    this.element.classList.remove('side-drawer--animatable');
    this.isAnimatable = false;
  }
}
// tslint:enable:no-unused-variable
