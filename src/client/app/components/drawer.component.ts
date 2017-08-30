import { Component, OnInit, OnDestroy, ELEMENT, HostListener, ChildListener, ViewChild } from '../../core';
import { listen, findElement } from '../../util';

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

  @ViewChild('.side-drawer__nav', { read: ELEMENT })
  private container: HTMLElement;

  constructor(private element: Element) {
    this.update = this.update.bind(this);
    this.onTransitionEnd = this.onTransitionEnd.bind(this);
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
      this.transitionEndDisp = listen(this.element, 'transitionend', this.onTransitionEnd);
      this.disableScroll();
    });
  }

  @HostListener('click')
  @ChildListener('.side-drawer__close', 'click')
  hideDrawer() {
    this.disableAnimatable();
    this.element.setAttribute('aria-hidden', 'true');
    this.transitionEndDisp = listen(this.element, 'transitionend', this.onTransitionEnd);
    this.enableScroll();
  }

  @ChildListener('.side-drawer__nav', 'click', ['$event'])
  private blockClicks(evt: MouseEvent, ) {
    evt.stopPropagation();
  }

  private disableScroll() {
    // tslint:disable-next-line:max-line-length
    const scrollPosition = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop;
    document.body.parentElement.classList.add('noscroll');
    document.body.style.width = window.innerWidth + 'px';
    document.body.style.height = window.innerHeight + 'px';
    document.body.scrollTop = scrollPosition;
  }

  private enableScroll() {
    document.body.parentElement.classList.remove('noscroll');
  }

  @HostListener('touchstart', ['$event'])
  private onTouchStart(evt: TouchEvent) {
    if (!this.isDrawerVisible)  {
      return false;
    }

    this.disableAnimatable();

    this.startX = evt.touches[0].pageX;
    this.currentX = this.startX;

    this.touchingDrawer = true;
    requestAnimationFrame(this.update);
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

  @HostListener('touchend')
  private onTouchEnd() {
    if (!this.touchingDrawer) {
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

  private onTransitionEnd(evt: Event) {
    this.disableAnimatable();
    if (this.transitionEndDisp) {
      this.transitionEndDisp();
      this.transitionEndDisp = null;
    }
  }

  private enableAnimatable() {
    this.element.classList.add('side-drawer--animatable');
  }

  private disableAnimatable() {
    this.element.classList.remove('side-drawer--animatable');
  }
}
