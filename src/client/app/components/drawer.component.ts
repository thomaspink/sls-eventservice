import {
  Component, ELEMENT, HostListener, ChildListener, ViewChild
} from '../../core';


// tslint:disable:no-unused-variable
@Component({
  selector: 'side-drawer',
  deps: [ELEMENT]
})
export class DrawerComponent {
  private startX = 0;
  private currentX = 0;
  private touchingDrawer = false;
  private trashhold = 0.5;
  private transitionEndDisp: Function | null = null;
  private isAnimatable = false;

  @ViewChild('.side-drawer__nav', { read: ELEMENT })
  private container: HTMLElement;

  @ViewChild('.side-drawer__close', { read: ELEMENT })
  private closeBtn: HTMLElement;

  constructor(private element: Element) {
    this.update = this.update.bind(this);
    this.onTransitionEnd = this.onTransitionEnd.bind(this);
    this.enableAnimatable();
  }

  toggleDrawer() {
    if (this.isDrawerVisible) {
      this.hideDrawer();
    } else {
      this.showDrawer();
    }
  }

  get isDrawerVisible() {
    return this.element.getAttribute('aria-hidden') === 'false';
  }

  showDrawer() {
    this.enableAnimatable();
    requestAnimationFrame(() => {
      this.element.setAttribute('aria-hidden', 'false');
      this.disableScroll();
    });
  }

  @HostListener('click')
  selfClicked() {
    console.log('selfClicked');
    this.hideDrawer();
  }

  @ChildListener('.side-drawer__close', 'click')
  hideDrawer() {
    console.log('hideDrawer');
    this.enableAnimatable();
    requestAnimationFrame(() => {
      this.element.setAttribute('aria-hidden', 'true');
      this.enableScroll();
    });
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

  @HostListener('touchstart', ['$event'])
  private onTouchStart(evt: TouchEvent) {
    if (this.isDrawerVisible && evt.target !== this.element &&
      evt.target !== this.closeBtn)  {
      this.disableAnimatable();

      this.startX = evt.touches[0].pageX;
      this.currentX = this.startX;

      this.touchingDrawer = true;
      requestAnimationFrame(this.update);
    }
  }

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

  @HostListener('touchend', ['$event'])
  private onTouchEnd(evt: TouchEvent) {
    if (!this.touchingDrawer) {
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

  private update() {
    if (!this.touchingDrawer) {
      return;
    }
    requestAnimationFrame(this.update);

    const translateX = Math.max(0, this.currentX - this.startX);
    this.container.style.transform = `translateX(${translateX}px)`;
  }

  @HostListener('transitionend')
  private onTransitionEnd(evt: Event) {
    console.log('transition end');
    if (!this.isAnimatable)
      return;
    this.disableAnimatable();
    if (this.transitionEndDisp) {
      this.transitionEndDisp();
      this.transitionEndDisp = null;
    }
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
