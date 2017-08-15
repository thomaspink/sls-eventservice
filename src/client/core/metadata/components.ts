import { Provider } from '../di/provider';
import { InjectionToken } from '../di/injection_token';
import { Type } from '../type';

export interface ComponentMetadata<C> {
  /**
   * The CSS selector that triggers the instantiation of a directive.
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
  type: Type<C>;

  /**
   * The CSS selector that triggers the instantiation of a directive.
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

  deps?: (Type<any> | InjectionToken<any>)[];
}
