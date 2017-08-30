import { Type } from '../type';
import { ReflectionCapabilities } from './reflection_capabilities';

/**
 * Provides access to reflection data about symbols. Used internally by Angular
 * to power dependency injection and compilation.
 */
export class Reflector {
  constructor(public reflectionCapabilities: ReflectionCapabilities) { }

  updateCapabilities(caps: ReflectionCapabilities) { this.reflectionCapabilities = caps; }

  factory(type: Type<any>): Function { return this.reflectionCapabilities.factory(type); }

  parameters(typeOrFunc: Type<any>): any[][] {
    return this.reflectionCapabilities.parameters(typeOrFunc);
  }

  annotations(typeOrFunc: Type<any>): any[] {
    return this.reflectionCapabilities.annotations(typeOrFunc);
  }

  propMetadata(typeOrFunc: Type<any>): { [key: string]: any[] } {
    return this.reflectionCapabilities.propMetadata(typeOrFunc);
  }
}
