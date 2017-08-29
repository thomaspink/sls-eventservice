import { Type } from '../type';
import { TypeDecorator, makePropDecorator, makeParamDecorator } from '../util/decorators';

/**
 * Type of the Attribute decorator / constructor function.
 *
 * @stable
 */
export interface AttributeDecorator {
  /**
   * Specifies that a constant attribute value should be injected.
   */
  (name: string): any;
  new(name: string): Attribute;
}

/**
 * Type of the Attribute metadata.
 */
export interface Attribute { attributeName?: string; }

/**
 * Type of the Query metadata.
 */
export interface Query {
  first: boolean;
  read: any;
  selector: any;
}

/**
 * Base class for query metadata.
 */
export abstract class Query { }

/**
 * Attribute decorator and metadata.
 */
export const Attribute: AttributeDecorator =
  makeParamDecorator('Attribute', (attributeName?: string) => ({ attributeName }));

/**
 * Type of the ViewChildren decorator / constructor function.
 */
export interface ViewChildrenDecorator {
  /**
   * You can use ViewChildren to get the {@link QueryList} of elements or directives from the
   * view DOM. Any time a child element is added, removed, or moved, the query list will be updated,
   * and the changes observable of the query list will emit a new value.
   *
   * View queries are set before the `ngAfterViewInit` callback is called.
   *
   * **Metadata Properties**:
   *
   * * **selector** - the directive type or the name used for querying.
   * * **read** - read a different token from the queried elements.
   */
  (selector: Type<any> | Function | string, opts?: { read?: any }): any;
  new(selector: Type<any> | Function | string, opts?: { read?: any }): ViewChildren;
}

/**
 * Type of the ViewChildren metadata.
 */
export type ViewChildren = Query;

/**
 * ViewChildren decorator and metadata.
 */
export const ViewChildren: ViewChildrenDecorator = makePropDecorator(
  'ViewChildren', (selector?: any, data: any = {}) =>
    ({ selector, first: false, ...data }),
  Query);

/**
 * Type of the ViewChild decorator / constructor function.
 */
export interface ViewChildDecorator {
  /**
   * You can use ViewChild to get the first element or the directive matching the selector from the
   * view DOM. If the view DOM changes, and a new child matches the selector,
   * the property will be updated.
   *
   * View queries are set before the `ngAfterViewInit` callback is called.
   *
   * **Metadata Properties**:
   *
   * * **selector** - the directive type or the name used for querying.
   * * **read** - read a different token from the queried elements.
   */
  (selector: Type<any> | Function | string, opts?: { read?: any }): any;
  new(selector: Type<any> | Function | string, opts?: { read?: any }): ViewChild;
}

/**
 * Type of the ViewChild metadata.
 *
 * @stable
 */
export type ViewChild = Query;

/**
 * ViewChild decorator and metadata.
 */
export const ViewChild: ViewChildDecorator = makePropDecorator(
  'ViewChild', (selector: any, data: any) =>
    ({ selector, first: true, ...data }),
  Query);
