/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {makeDecorator, makeParamDecorator} from '../util/decorators';

/**
 * Type of the Optional decorator / constructor function.
 *
 * @stable
 */
export interface OptionalDecorator {
  /**
   * @whatItDoes A parameter metadata that marks a dependency as optional.
   * {@link Injector} provides `null` if the dependency is not found.
   * @howToUse
   * ```
   * @Injectable()
   * class Car {
   *   constructor(@Optional() public engine:Engine) {}
   * }
   * ```
   *
   * @description
   * For more details, see the {@linkDocs guide/dependency-injection "Dependency Injection Guide"}.
   *
   * ### Example
   *
   * {@example core/di/ts/metadata_spec.ts region='Optional'}
   *
   * @stable
   */
  (): any;
  new (): Optional;
}

/**
 * Type of the Optional metadata.
 *
 * @stable
 */
export interface Optional {}

/**
 * Optional decorator and metadata.
 *
 * @stable
 * @Annotation
 */
export const Optional: OptionalDecorator = makeParamDecorator('Optional');

/**
 * Type of the Self decorator / constructor function.
 *
 * @stable
 */
export interface SelfDecorator {
  /**
   * @whatItDoes Specifies that an {@link Injector} should retrieve a dependency only from itself.
   * @howToUse
   * ```
   * @Injectable()
   * class Car {
   *   constructor(@Self() public engine:Engine) {}
   * }
   * ```
   *
   * @description
   * For more details, see the {@linkDocs guide/dependency-injection "Dependency Injection Guide"}.
   *
   * ### Example
   *
   * {@example core/di/ts/metadata_spec.ts region='Self'}
   *
   * @stable
   */
  (): any;
  new (): Self;
}

/**
 * Type of the Self metadata.
 *
 * @stable
 */
export interface Self {}

/**
 * Self decorator and metadata.
 *
 * @stable
 * @Annotation
 */
export const Self: SelfDecorator = makeParamDecorator('Self');


/**
 * Type of the SkipSelf decorator / constructor function.
 *
 * @stable
 */
export interface SkipSelfDecorator {
  /**
   * @whatItDoes Specifies that the dependency resolution should start from the parent injector.
   * @howToUse
   * ```
   * @Injectable()
   * class Car {
   *   constructor(@SkipSelf() public engine:Engine) {}
   * }
   * ```
   *
   * @description
   * For more details, see the {@linkDocs guide/dependency-injection "Dependency Injection Guide"}.
   *
   * ### Example
   *
   * {@example core/di/ts/metadata_spec.ts region='SkipSelf'}
   *
   * @stable
   */
  (): any;
  new (): SkipSelf;
}

/**
 * Type of the SkipSelf metadata.
 *
 * @stable
 */
export interface SkipSelf {}

/**
 * SkipSelf decorator and metadata.
 *
 * @stable
 * @Annotation
 */
export const SkipSelf: SkipSelfDecorator = makeParamDecorator('SkipSelf');

/**
 * Type of the Host decorator / constructor function.
 *
 * @stable
 */
export interface HostDecorator {
  /**
   * @whatItDoes Specifies that an injector should retrieve a dependency from any injector until
   * reaching the host element of the current component.
   * @howToUse
   * ```
   * @Injectable()
   * class Car {
   *   constructor(@Host() public engine:Engine) {}
   * }
   * ```
   *
   * @description
   * For more details, see the {@linkDocs guide/dependency-injection "Dependency Injection Guide"}.
   *
   * ### Example
   *
   * {@example core/di/ts/metadata_spec.ts region='Host'}
   *
   * @stable
   */
  (): any;
  new (): Host;
}

/**
 * Type of the Host metadata.
 *
 * @stable
 */
export interface Host {}

/**
 * Host decorator and metadata.
 *
 * @stable
 * @Annotation
 */
export const Host: HostDecorator = makeParamDecorator('Host');
