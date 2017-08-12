import { registerComponent, OnInit, OnDestroy } from '../core';
import { listen, findElement } from '../util';

export class DrawerComponent implements OnInit, OnDestroy {
  private delegates: Function[] = [];
  private container: HTMLElement;
  private closeBtn: Element;
  private startX = 0;
  private currentX = 0;
  private touchingDrawer = false;
  private trashhold = 0.5;

  constructor(private element: Element) {
    this.container = findElement('.side-drawer__nav', element) as HTMLElement;
    this.closeBtn = findElement('.side-drawer__close', element);
  }

  onInit() {
    this.delegates.push(listen(this.element, 'click', this.hideDrawer.bind(this)));
    this.delegates.push(listen(this.element, 'touchstart', this.onTouchStart.bind(this)));
    this.delegates.push(listen(this.element, 'touchmove', this.onTouchMove.bind(this)));
    this.delegates.push(listen(this.element, 'touchend', this.onTouchEnd.bind(this)));
    this.delegates.push(listen(this.container, 'click', this.blockClicks.bind(this)));
    this.delegates.push(listen(this.closeBtn, 'click', this.hideDrawer.bind(this)));
  }

  onDestroy() {
    this.delegates.forEach(fn => fn());
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
    this.element.classList.add('side-drawer--animatable');
    this.element.setAttribute('aria-hidden', 'false');
    this.element.addEventListener('transitionend', this.onTransitionEnd);
    this.disableScroll();
  }

  hideDrawer() {
    this.element.classList.add('side-drawer--animatable');
    this.element.setAttribute('aria-hidden', 'true');
    this.element.addEventListener('transitionend', this.onTransitionEnd);
    this.enableScroll();
  }

  blockClicks(evt: MouseEvent) {
    evt.stopPropagation();
  }

  disableScroll() {
    // tslint:disable-next-line:max-line-length
    const scrollPosition = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop;
    document.body.parentElement.classList.add('noscroll');
    document.body.style.width = window.innerWidth + 'px';
    document.body.style.height = window.innerHeight + 'px';
    document.body.scrollTop = scrollPosition;
  }

  enableScroll() {
    document.body.parentElement.classList.remove('noscroll');
  }

  onTouchStart(evt: TouchEvent) {
    if (!this.isDrawerVisible) {
      return;
    }

    this.startX = evt.touches[0].pageX;
    this.currentX = this.startX;

    this.touchingDrawer = true;
    requestAnimationFrame(this.update);
  }

  onTouchMove(evt: TouchEvent) {
    if (!this.touchingDrawer) {
      return;
    }
    this.currentX = evt.touches[0].pageX;
    const translateX = Math.max(0, this.currentX - this.startX);

    if (translateX > 290 * this.trashhold) {
      evt.preventDefault();
    }
  }

  onTouchEnd() {
    if (!this.touchingDrawer) {
      return;
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

  update() {
    if (!this.touchingDrawer) {
      return;
    }
    requestAnimationFrame(this.update);

    const translateX = Math.max(0, this.currentX - this.startX);;
    this.container.style.transform = `translateX(${translateX}px)`;
  }

  onTransitionEnd(evt: Event) {
    this.element.classList.remove('side-drawer--animatable');
    this.element.removeEventListener('transitionend', this.onTransitionEnd);
  }
}
registerComponent('side-drawer', DrawerComponent);
