import {ComponentFactoryResolver, ApplicationRef, Injector, Provider} from '../../../core';
import {OverlayConfig} from './overlay-config';
import {OverlayContainer, OVERLAY_CONTAINER_PROVIDER} from './overlay-container';
import {OverlayRef} from './overlay-ref';

/** Next overlay unique ID. */
let nextUniqueId = 0;

/** The default state for newly created overlays. */
let defaultState = new OverlayConfig();

export class Overlay {
  constructor(
    private _overlayContainer: OverlayContainer,
    private _componentFactoryResolver: ComponentFactoryResolver,
    private _appRef: ApplicationRef,
    private _injector: Injector) {}

  /**
   * Creates an overlay.
   * @param state State to apply to the overlay.
   * @returns Reference to the created overlay.
   */
  create(state: OverlayConfig = defaultState): OverlayRef {
    const pane = this._createPaneElement();
    // const portalHost = this._createPortalHost(pane);
    return new OverlayRef(/*portalHost,*/ pane, state);
  }

  /**
   * Creates the DOM element for an overlay and appends it to the overlay container.
   * @returns Newly-created pane element
   */
  private _createPaneElement(): HTMLElement {
    let pane = document.createElement('div');

    pane.id = `cdk-overlay-${nextUniqueId++}`;
    pane.classList.add('cdk-overlay-pane');
    this._overlayContainer.getContainerElement().appendChild(pane);

    return pane;
  }
}

export const OVERLAY_PROVIDERS: Provider[] = [
  OVERLAY_CONTAINER_PROVIDER,
  { provide: Overlay, deps: [OverlayContainer, ComponentFactoryResolver, ApplicationRef, Injector] }
];
