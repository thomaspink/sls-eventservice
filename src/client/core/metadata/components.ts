import { Provider } from '../di/provider';
import { InjectionToken } from '../di/injection_token';
import { Type } from '../type';
import {TypeDecorator, makeDecorator, makePropDecorator} from '../util/decorators';

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
   * directives can control their runtime behavior by implementing various Life-Cycle hooks.
   */
  (obj: Component): TypeDecorator;

  /**
   * See the Component decorator.
   */
  new (obj: Component): Component;
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
  deps?: (Type<any> | InjectionToken<any>)[];

  /**
   * A list of child components
   */
  components?: Type<any>[];
}

/**
 * Directive decorator and metadata.
 *
 * @stable
 * @Annotation
 */
// tslint:disable-next-line:variable-name
export const Component: ComponentDecorator =
  makeDecorator('Component', (comp: Component = {selector: ''}) => comp);
