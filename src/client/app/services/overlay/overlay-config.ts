/** OverlayConfig captures the initial configuration used when opening an overlay. */
export class OverlayConfig {
  /** Strategy with which to position the overlay. */
  // positionStrategy?: PositionStrategy;

  /** Strategy to be used when handling scroll events while the overlay is open. */
  // scrollStrategy?: ScrollStrategy = new NoopScrollStrategy();

  /** Custom class to add to the overlay pane. */
  panelClass?: string | string[] = '';

  /** Whether the overlay has a backdrop. */
  hasBackdrop?: boolean = false;

  /** Custom class to add to the backdrop */
  backdropClass?: string = 'cdk-overlay-dark-backdrop';

  /** The width of the overlay panel. If a number is provided, pixel units are assumed. */
  width?: number | string;

  /** The height of the overlay panel. If a number is provided, pixel units are assumed. */
  height?: number | string;

  /** The min-width of the overlay panel. If a number is provided, pixel units are assumed. */
  minWidth?: number | string;

  /** The min-height of the overlay panel. If a number is provided, pixel units are assumed. */
  minHeight?: number | string;

  /** The max-width of the overlay panel. If a number is provided, pixel units are assumed. */
  maxWidth?: number | string;

  /** The max-height of the overlay panel. If a number is provided, pixel units are assumed. */
  maxHeight?: number | string;

  /** The direction of the text in the overlay panel. */
  // direction?: Direction = 'ltr';

  constructor(state?: OverlayConfig) {
    if (state) {
      Object.keys(state).forEach(key => this[key] = state[key]);
    }
  }
}
