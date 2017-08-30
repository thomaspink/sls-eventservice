import { Type } from '../type';
import { stringify } from '../util';
import { splitAtColon } from './util';
import { Reflector } from '../reflection/reflection';
import { Component, Output, HostListener, ChildListener } from '../metadata/components';
import { ViewChild, ViewChildren } from '../metadata/di';
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
      if (metadata) {
        const propertyMetadata = this._reflector.propMetadata(type);
        return this._mergeWithPropertyMetadata(metadata, propertyMetadata, type);
      }
    }

    if (throwIfNotFound) {
      throw new Error(`No Component annotation found on ${stringify(type)}`);
    }
  }

  private _mergeWithPropertyMetadata(comp: Component, propertyMetadata: { [key: string]: any[] },
    componentType: Type<any>) {
    const outputs: string[] = [];
    const host: { [key: string]: string } = {};
    const bindings: { [key: string]: any } = {};
    const queries: { [key: string]: any } = {};

    Object.keys(propertyMetadata).forEach((propName: string) => {
      const output = findLast(propertyMetadata[propName], (a) => isTypeOf(a, Output));
      if (output) {
        if (output.bindingPropertyName) {
          outputs.push(`${propName}: ${output.bindingPropertyName}`);
        } else {
          outputs.push(propName);
        }
      }
      const hostListeners = propertyMetadata[propName].filter(m => isTypeOf(m, HostListener));
      hostListeners.forEach(hostListener => {
        const args = hostListener.args || [];
        host[`(${hostListener.eventName})`] = `${propName}(${args.join(',')})`;
      });
      const childListeners = propertyMetadata[propName].filter(m => isTypeOf(m, ChildListener));
      childListeners.forEach((childListener: any) => {
        const args = childListener.args || [];
        let binding = bindings[childListener.selector];
        if (!binding) {
          binding = Object.create({});
          bindings[childListener.selector] = binding;
        }
        binding[`(${childListener.eventName})`] = `${propName}(${args.join(',')})`;
      });
      const query = findLast(propertyMetadata[propName],
        (a) => isTypeOf(a, ViewChildren) || isTypeOf(a, ViewChild));
      if (query) {
        queries[propName] = query;
      }
    });
    return this._merge(comp, outputs, host, bindings, queries, componentType);
  }

  private _extractPublicName(def: string) { return splitAtColon(def, [null !, def])[1].trim(); }

  private _dedupeBindings(bindings: string[]): string[] {
    const names = new Set<string>();
    const reversedResult: string[] = [];
    // go last to first to allow later entries to overwrite previous entries
    for (let i = bindings.length - 1; i >= 0; i--) {
      const binding = bindings[i];
      const name = this._extractPublicName(binding);
      if (!names.has(name)) {
        names.add(name);
        reversedResult.push(binding);
      }
    }
    return reversedResult.reverse();
  }

  private _merge(comp: Component, outputs: string[], host: { [key: string]: string },
    bindings: { [key: string]: string }, queries: { [key: string]: any },
    componentType: Type<any>): Component {
      const mergedOutputs =
      this._dedupeBindings(comp.outputs ? comp.outputs.concat(outputs) : outputs);
    const mergedHost = comp.host ? { ...comp.host, ...host } : host;
    const mergedBindings = comp.bindings ? { ...comp.bindings, ...bindings } : bindings;
    const mergedQueries = comp.queries ? {...comp.queries, ...queries} : queries;

    return {
      selector: comp.selector,
      outputs: mergedOutputs,
      host: mergedHost,
      bindings: mergedBindings,
      queries: mergedQueries,
      providers: comp.providers,
      deps: comp.deps,
      components: comp.components,
    };
  }
}

function isComponentMetadata(type: any): type is Component {
  return type instanceof Component;
}

function isTypeOf(instance: any, type: Type<any>): boolean {
  return instance instanceof type;
}

export function findLast<T>(arr: T[], condition: (value: T) => boolean): T | null {
  for (let i = arr.length - 1; i >= 0; i--) {
    if (condition(arr[i])) {
      return arr[i];
    }
  }
  return null;
}
