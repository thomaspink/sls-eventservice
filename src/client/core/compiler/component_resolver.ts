import { Type } from '../type';
import { stringify } from '../util';
import { Reflector } from '../reflection/reflection';
import { Component } from '../metadata/components';
import { resolveForwardRef } from '../di/forward_ref';

export class ComponentResolver {
  constructor(private _reflector: Reflector) { }

  isComponent(type: Type<any>) {
    const typeMetadata = this._reflector.annotations(resolveForwardRef(type));
    return typeMetadata && typeMetadata.some(isComponentMetadata);
  }

  /**
   * Return Component for a given `Type`.
   */
  resolve(type: Type<any>): Component;
  resolve(type: Type<any>, throwIfNotFound: true): Component;
  resolve(type: Type<any>, throwIfNotFound: boolean): Component | null;
  resolve(type: Type<any>, throwIfNotFound = true): Component | null {
    const typeMetadata = this._reflector.annotations(resolveForwardRef(type));
    if (typeMetadata) {
      const metadata = findLast(typeMetadata, isComponentMetadata);
      return metadata;
    }

    if (throwIfNotFound) {
      throw new Error(`No Component annotation found on ${stringify(type)}`);
    }
  }
}

function isComponentMetadata(type: any): type is Component {
  return type instanceof Component;
}

export function findLast<T>(arr: T[], condition: (value: T) => boolean): T | null {
  for (let i = arr.length - 1; i >= 0; i--) {
    if (condition(arr[i])) {
      return arr[i];
    }
  }
  return null;
}
