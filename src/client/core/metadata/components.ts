// tslint:disable:variable-name
import { Provider } from '../di/provider';
import { InjectionToken } from '../di/injection_token';
import { Type } from '../type';
import { TypeDecorator, makeDecorator, makePropDecorator } from '../util/decorators';

/**
 * Type of the Component decorator / constructor function.
 *
 * @stable
 */
export interface ComponentDecorator {
  /**
   * Marks a class as a component and collects component configuration
   * metadata.
   *
   * @description
   *
   * Component decorator allows you to mark a class as an component and provide additional
   * metadata that determines how the component should be processed, instantiated and used at
   * runtime.
   *
   * In addition to the metadata configuration specified via the component decorator,
   * components can control their runtime behavior by implementing various Life-Cycle hooks.
   */
  (obj: Component): TypeDecorator;

  /**
   * See the Component decorator.
   */
  new(obj: Component): Component;
}

export interface Component {
  /**
   * The CSS selector that triggers the instantiation of a component.
   *
   * `selector` may be declared as one of the following:
   *
   * - `element-name`: select by element name.
   * - `.class`: select by class name.
   * - `[attribute]`: select by attribute name.
   * - `[attribute=value]`: select by attribute name and value.
   * - `:not(sub_selector)`: select only if the element does not match the `sub_selector`.
   * - `selector1, selector2`: select if either `selector1` or `selector2` matches.
   */
  selector: string;

  /**
   * Defines the set of injectable objects that are visible to a Component and its light DOM
   * children.
   */
  providers?: Provider[];

  /**
   * A list of `token`s which need to be resolved by the injector. The list of values is then
   * used as arguments to the constructor.
   */
  deps?: (Type<any> | InjectionToken<any> | any)[];

  /**
   * A list of child components
   */
  components?: (Type<any>|any[])[];

  /**
   * Enumerates the set of event-bound output properties.
   *
   * When an output property emits an event, an event handler attached to that event
   * the template is invoked.
   *
   * The `outputs` property defines a set of `directiveProperty` to `bindingProperty`
   * configuration:
   *
   * - `directiveProperty` specifies the component property that emits events.
   * - `bindingProperty` specifies the DOM property the event handler is attached to.
   *
   * ### Example
   *
   * ```typescript
   * @Component({
   *   selector: 'interval-dir',
   *   outputs: ['everySecond', 'five5Secs: everyFiveSeconds']
   * })
   * class IntervalComponent {
   *   everySecond = new EventEmitter();
   *   five5Secs = new EventEmitter();
   *
   *   constructor() {
   *     setInterval(() => this.everySecond.emit("event"), 1000);
   *     setInterval(() => this.five5Secs.emit("event"), 5000);
   *   }
   * }
   *
   * @Component({
   *   selector: 'app',
   *   template: `
   *     <interval-dir (everySecond)="everySecond()" (everyFiveSeconds)="everyFiveSeconds()">
   *     </interval-dir>
   *   `
   * })
   * class App {
   *   everySecond() { console.log('second'); }
   *   everyFiveSeconds() { console.log('five seconds'); }
   * }
   * ```
   *
   */
  outputs?: string[];

  /**
   * Specify the events, actions, properties and attributes related to the host element.
   *
   * ## Host Listeners
   *
   * Specifies which DOM events a component listens to via a set of `(event)` to `method`
   * key-value pairs:
   *
   * - `event`: the DOM event that the component listens to.
   * - `statement`: the statement to execute when the event occurs.
   * If the evaluation of the statement returns `false`, then `preventDefault`is applied on the DOM
   * event.
   *
   * To listen to global events, a target must be added to the event name.
   * The target can be `window`, `document` or `body`.
   *
   * When writing a component event binding, you can also refer to the $event local variable.
   *
   * ### Example
   *
   * The following example declares a component that attaches a click listener to the button and
   * counts clicks.
   *
   * ```typescript
   * @Component({
   *   selector: 'button[counting]',
   *   host: {
   *     '(click)': 'onClick($event.target)'
   *   }
   * })
   * class CountClicks {
   *   numberOfClicks = 0;
   *
   *   onClick(btn) {
   *     console.log("button", btn, "number of clicks:", this.numberOfClicks++);
   *   }
   * }
   *
   * @Component({
   *   selector: 'app',
   *   template: `<button counting>Increment</button>`
   * })
   * class App {}
   * ```
   *
   * ## Host Property Bindings
   *
   * Specifies which DOM properties a component updates.
   *
   * ### Example
   *
   * The following example creates a component that sets the `valid` and `invalid` classes
   * on the DOM element that has ngModel component on it.
   *
   * ```typescript
   * @Component({
   *   selector: '[ngModel]',
   *   host: {
   *     '[class.valid]': 'valid',
   *     '[class.invalid]': 'invalid'
   *   }
   * })
   * class NgModelStatus {
   *   constructor(public control:NgModel) {}
   *   get valid { return this.control.valid; }
   *   get invalid { return this.control.invalid; }
   * }
   *
   * @Component({
   *   selector: 'app',
   *   template: `<input [(ngModel)]="prop">`
   * })
   * class App {
   *   prop;
   * }
   * ```
   *
   * ## Attributes
   *
   * Specifies static attributes that should be propagated to a host element.
   *
   * ### Example
   *
   * In this example using `my-button` component (ex.: `<div my-button></div>`) on a host element
   * (here: `<div>` ) will ensure that this element will get the "button" role.
   *
   * ```typescript
   * @Component({
   *   selector: '[my-button]',
   *   host: {
   *     'role': 'button'
   *   }
   * })
   * class MyButton {
   * }
   * ```
   */
  host?: { [key: string]: string };

  bindings?: { [key: string]: any };

  /**
   * Configures the queries that will be injected into the directive.
   *
   * Content queries are set before the `ngAfterContentInit` callback is called.
   * View queries are set before the `ngAfterViewInit` callback is called.
   *
   * ### Example
   *
   * ```
   * @Component({
   *   selector: 'someDir',
   *   queries: {
   *     viewChildren: new ViewChildren(ChildDirective)
   *   },
   *   template: '<child-directive></child-directive>'
   * })
   * class SomeDir {
   *   viewChildren: QueryList<ChildDirective>
   * ```
   */
  queries?: { [key: string]: any };

  /**
   * Specifies an inline template for an Angular component.
   *
   * Only one of `templateUrl` or `template` can be defined per Component.
   */
  template?: string;
}

/**
 * Component decorator and metadata.
 */
export const Component: ComponentDecorator =
  makeDecorator('Component', (comp: Component = { selector: '' }) => comp);

/**
 * Type of the Output decorator / constructor function.
 *
 * @stable
 */
export interface OutputDecorator {
  /**
   * Declares an event-bound output property.
   *
   * When an output property emits an event, an event handler attached to that event
   * the template is invoked.
   *
   * `Output` takes an optional parameter that specifies the name
   * used when instantiating a component in the template. When not provided,
   * the name of the decorated property is used.
   *
   * ### Example
   *
   * ```typescript
   * @Directive({
   *   selector: 'interval-dir',
   * })
   * class IntervalDir {
   *   @Output() everySecond = new EventEmitter();
   *   @Output('everyFiveSeconds') five5Secs = new EventEmitter();
   *
   *   constructor() {
   *     setInterval(() => this.everySecond.emit("event"), 1000);
   *     setInterval(() => this.five5Secs.emit("event"), 5000);
   *   }
   * }
   *
   * @Component({
   *   selector: 'app',
   *   template: `
   *     <interval-dir (everySecond)="everySecond()" (everyFiveSeconds)="everyFiveSeconds()">
   *     </interval-dir>
   *   `
   * })
   * class App {
   *   everySecond() { console.log('second'); }
   *   everyFiveSeconds() { console.log('five seconds'); }
   * }
   * ```
   * @stable
   */
  (bindingPropertyName?: string): any;
  new(bindingPropertyName?: string): any;
}

/**
 * Type of the Output metadata.
 *
 * @stable
 */
export interface Output { bindingPropertyName?: string; }

/**
 * Output decorator and metadata.
 *
 * @stable
 * @Annotation
 */
export const Output: OutputDecorator =
  makePropDecorator('Output', (bindingPropertyName?: string) => ({ bindingPropertyName }));


/**
 * Type of the HostListener decorator / constructor function.
 */
export interface HostListenerDecorator {
  /**
   * Declares a host listener.
   *
   * Mojito will invoke the decorated method when the host element emits the specified event.
   *
   * If the decorated method returns `false`, then `preventDefault` is applied on the DOM event.
   */
  (eventName: string, args?: string[]): any;
  new(eventName: string, args?: string[]): any;
}

/**
 * Type of the HostListener metadata.
 */
export interface HostListener {
  eventName?: string;
  args?: string[];
}

/**
 * HostListener decorator and metadata.
 */
export const HostListener: HostListenerDecorator =
  makePropDecorator('HostListener', (eventName?: string, args?: string[]) => ({ eventName, args }));

/**
* Type of the HostListener decorator / constructor function.
*/
export interface ChildListenerDecorator {
  /**
   * Declares a child listener.
   *
   * Mojito will invoke the decorated method when the child element emits the specified event.
   *
   * If the decorated method returns `false`, then `preventDefault` is applied on the DOM event.
   */
  (selector: string | Type<any>, eventName: string, args?: string[]): any;
  new(selector: string | Type<any>, eventName: string, args?: string[]): any;
}

/**
 * Type of the ChildListener metadata.
 */
export interface ChildListener {
  selector: string | Type<any>;
  eventName?: string;
  args?: string[];
}

/**
 * ChildListener decorator and metadata.
 */
export const ChildListener: ChildListenerDecorator =
  makePropDecorator('ChildListener',
    (selector: string | Type<any>, eventName?: string, args?: string[]) =>
      ({ selector, eventName, args }));
