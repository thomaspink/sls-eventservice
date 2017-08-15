import { registerComponent, OnInit, OnDestroy } from '../../core';
import { listen, findElement } from '../../util';

export class DrawerComponent implements OnInit, OnDestroy {
  private delegates: Function[] = [];
  private container: HTMLElement;
  private closeBtn: Element;
  private startX = 0;
  private currentX = 0;
  private touchingDrawer = false;
  private trashhold = 0.5;
  private transitionEndDisp: Function|null = null;

  constructor(private element: Element) {
    this.container = findElement('.side-drawer__nav', element) as HTMLElement;
    this.closeBtn = findElement('.side-drawer__close', element);
    this.hideDrawer = this.hideDrawer.bind(this);
    this.onTouchStart = this.onTouchStart.bind(this);
    this.onTouchMove = this.onTouchMove.bind(this);
    this.onTouchEnd = this.onTouchEnd.bind(this);
    this.blockClicks = this.blockClicks.bind(this);
    this.onTransitionEnd = this.onTransitionEnd.bind(this);
    this.update = this.update.bind(this);
  }

  onInit() {
    this.delegates.push(listen(this.element, 'click', this.hideDrawer));
    this.delegates.push(listen(this.element, 'touchstart', this.onTouchStart));
    this.delegates.push(listen(this.element, 'touchmove', this.onTouchMove));
    this.delegates.push(listen(this.element, 'touchend', this.onTouchEnd));
    this.delegates.push(listen(this.container, 'click', this.blockClicks));
    this.delegates.push(listen(this.closeBtn, 'click', this.hideDrawer));
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
    this.enableAnimatable();
    requestAnimationFrame(() => {
      this.element.setAttribute('aria-hidden', 'false');
      this.transitionEndDisp = listen(this.element, 'transitionend', this.onTransitionEnd);
      this.disableScroll();
    });
  }

  hideDrawer() {
    this.disableAnimatable();
    this.element.setAttribute('aria-hidden', 'true');
    this.transitionEndDisp = listen(this.element, 'transitionend', this.onTransitionEnd);
    this.enableScroll();
  }

  private blockClicks(evt: MouseEvent) {
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

  private onTouchStart(evt: TouchEvent) {
    if (!this.isDrawerVisible) {
      return;
    }

    this.disableAnimatable();

    this.startX = evt.touches[0].pageX;
    this.currentX = this.startX;

    this.touchingDrawer = true;
    requestAnimationFrame(this.update);
  }

  private onTouchMove(evt: TouchEvent) {
    if (!this.touchingDrawer) {
      return;
    }
    this.currentX = evt.touches[0].pageX;
    const translateX = Math.max(0, this.currentX - this.startX);

    if (translateX > 290 * this.trashhold) {
      evt.preventDefault();
    }
  }

  private onTouchEnd() {
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
registerComponent('side-drawer', DrawerComponent);
