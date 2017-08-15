import {Type} from '../type';

/**
 * Configures the Injector to return a value for a token.
 * ```
 * const provider: ValueProvider = {provide: 'someToken', useValue: 'someValue'};
 * ```
 */
export interface ValueProvider {
  /**
   * An injection token. (Typically an instance of `Type` or `InjectionToken`, but can be `any`).
   */
  provide: any;

  /**
   * The value to inject.
   */
  useValue: any;
}

/**
 * Configures the Injector to return an instance of `useClass` for a token.
 * ```
 * class MyService {}
 *
 * const provider: ClassProvider = {provide: 'someToken', useClass: MyService, deps: []};
 * ```
 */
export interface ClassProvider {
  /**
   * An injection token. (Typically an instance of `Type` or `InjectionToken`, but can be `any`).
   */
  provide: any;

  /**
   * An optional class to instantiate for the `token`. (If not provided `provide` is assumed to be a
   * class to
   * instantiate)
   */
  useClass: Type<any>;

  /**
   * A list of `token`s which need to be resolved by the injector. The list of values is then
   * used as arguments to the `useClass` constructor.
   */
  deps: any[];
}

/**
 * Configures the Injector to return an instance of a token.
 * ```
 * class MyService {}
 *
 * const provider: ClassProvider = {provide: MyClass, deps: []};
 */
export interface ConstructorProvider {
  /**
   * An injection token. (Typically an instance of `Type` or `InjectionToken`, but can be `any`).
   */
  provide: Type<any>;

  /**
   * A list of `token`s which need to be resolved by the injector. The list of values is then
   * used as arguments to the `useClass` constructor.
   */
  deps: any[];
}

/**
 * Configures the Injector to return a value of another `useExisting` token.
 * ```
 * const provider: ExistingProvider = {provide: 'someToken', useExisting: 'someOtherToken'};
 * ```
 */
export interface ExistingProvider {
  /**
   * An injection token. (Typically an instance of `Type` or `InjectionToken`, but can be `any`).
   */
  provide: any;

  /**
   * Existing `token` to return. (equivalent to `injector.get(useExisting)`)
   */
  useExisting: any;
}

/**
 * Configures the Injector to return a value by invoking a `useFactory`
 * function.
 * ```
 * function serviceFactory() { ... }
 *
 * const provider: FactoryProvider = {provide: 'someToken', useFactory: serviceFactory, deps: []};
 * ```
 */
export interface FactoryProvider {
  /**
   * An injection token. (Typically an instance of `Type` or `InjectionToken`, but can be `any`).
   */
  provide: any;

  /**
   * A function to invoke to create a value for this `token`. The function is invoked with
   * resolved values of `token`s in the `deps` field.
   */
  useFactory: Function;

  /**
   * A list of `token`s which need to be resolved by the injector. The list of values is then
   * used as arguments to the `useFactory` function.
   */
  deps?: any[];
}

/**
 * Describes how the Injector should be configured.
 */
export type Provider = ValueProvider | ExistingProvider | ClassProvider |
ConstructorProvider | FactoryProvider | any[];
