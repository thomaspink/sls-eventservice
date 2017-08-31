// tslint:disable:no-bitwise

import { stringify } from '../util';
import { Type } from '../type';
import { InjectionToken } from './injection_token';
import { resolveForwardRef } from './forward_ref';
import {
  Provider, ClassProvider, ConstructorProvider, ExistingProvider, FactoryProvider,
  ValueProvider
} from './provider';

const _THROW_IF_NOT_FOUND = new Object();
export const THROW_IF_NOT_FOUND = _THROW_IF_NOT_FOUND;


class NullInjector implements Injector {
  get(token: any, notFoundValue: any = _THROW_IF_NOT_FOUND): any {
    if (notFoundValue === _THROW_IF_NOT_FOUND) {
      throw new Error(`NullInjectorError: No provider for ${stringify(token)}!`);
    }
    return notFoundValue;
  }
}

/**
 * Injector interface
 * ```
 * const injector: Injector = ...;
 * injector.get(...);
 */
export abstract class Injector {
  static THROW_IF_NOT_FOUND = _THROW_IF_NOT_FOUND;
  static NULL: Injector = new NullInjector();

  /**
   * Retrieves an instance from the injector based on the provided token.
   * If not found:
   * - Throws an error if no `notFoundValue` that is not equal to
   * Injector.THROW_IF_NOT_FOUND is given
   * - Returns the `notFoundValue` otherwise
   */
  abstract get<T>(token: Type<T> | InjectionToken<T>, notFoundValue?: T): T;

  /**
   * Create a new Injector which is configure using `StaticProvider`s.
   *
   * ### Example
   *
   * {@example core/di/ts/provider_spec.ts region='ConstructorProvider'}
   */
  static create(providers: Provider[], parent?: Injector): Injector {
    return new StaticInjector(providers, parent);
  }
}

const IDENT = function <T>(value: T): T {
  return value;
};
const EMPTY = <any[]>[];
const CIRCULAR = IDENT;
const GET_PROPERTY_NAME = {} as any;
const USE_VALUE =
  getClosureSafeProperty<ValueProvider>({ provide: String, useValue: GET_PROPERTY_NAME });
const TOKEN_PATH = 'tokenPath';
const TEMP_TOKEN_PATH = 'tempTokenPath';
const NULL_INJECTOR = Injector.NULL;
const NEW_LINE = /\n/gm;
const NO_NEW_LINE = 'ɵ';

export class StaticInjector implements Injector {
  readonly parent: Injector;

  private _records: Map<any, Record>;

  constructor(providers: Provider[], parent: Injector = NULL_INJECTOR) {
    this.parent = parent;
    const records = this._records = new Map<any, Record>();
    records.set(
      Injector, <Record>{ token: Injector, fn: IDENT, deps: EMPTY, value: this, useNew: false });
    recursivelyProcessProviders(records, providers);
  }

  get<T>(token: Type<T> | InjectionToken<T>, notFoundValue?: T): T {
    const record = this._records.get(token);
    try {
      return tryResolveToken(token, record, this._records, this.parent, notFoundValue);
    } catch (e) {
      const tokenPath: any[] = e[TEMP_TOKEN_PATH];
      e.message = formatError('\n' + e.message, tokenPath);
      e[TOKEN_PATH] = tokenPath;
      e[TEMP_TOKEN_PATH] = null;
      throw e;
    }
  }

  toString() {
    const tokens = <string[]>[], records = this._records;
    records.forEach((v: any, token: any) => tokens.push(stringify(token)));
    return `StaticInjector[${tokens.join(', ')}]`;
  }
}

type SupportedProvider =
  ValueProvider | ExistingProvider | ClassProvider | ConstructorProvider | FactoryProvider;

interface Record {
  fn: Function;
  useNew: boolean;
  deps: DependencyRecord[];
  value: any;
}

interface DependencyRecord {
  token: any;
  // options: number;
}

function resolveProvider(provider: SupportedProvider): Record {
  const deps = computeDeps(provider);
  let fn: Function = IDENT;
  let value: any = EMPTY;
  let useNew = false;
  let provide = resolveForwardRef(provider.provide);
  if (USE_VALUE in provider) {
    // We need to use USE_VALUE in provider since provider.useValue could be defined as undefined.
    value = (provider as ValueProvider).useValue;
  } else if ((provider as FactoryProvider).useFactory) {
    fn = (provider as FactoryProvider).useFactory;
  } else if ((provider as ExistingProvider).useExisting) {
    // Just use IDENT
  } else if ((provider as ClassProvider).useClass) {
    useNew = true;
    fn = resolveForwardRef((provider as ClassProvider).useClass);
  } else if (typeof provide == 'function') {
    useNew = true;
    fn = provide;
  } else {
    throw staticError(
      // tslint:disable-next-line:max-line-length
      'Provider does not have [useValue|useFactory|useExisting|useClass] or [provide] is not newable',
      provider);
  }
  return { deps, fn, useNew, value };
}

function recursivelyProcessProviders(records: Map<any, Record>, provider: Provider) {
  if (provider) {
    provider = resolveForwardRef(provider);
    if (provider instanceof Array) {
      // if we have an array recurse into the array
      for (let i = 0; i < provider.length; i++) {
        recursivelyProcessProviders(records, provider[i]);
      }
    } else if (provider && typeof provider === 'object' && provider.provide) {
      // At this point we have what looks like a provider: {provide: ?, ....}
      let token = resolveForwardRef(provider.provide);
      const resolvedProvider = resolveProvider(provider);
      records.set(token, resolvedProvider);
    } else {
      throw staticError('Unexpected provider', provider);
    }
  }
}

function tryResolveToken(
  token: any, record: Record | undefined, records: Map<any, Record>, parent: Injector,
  notFoundValue: any): any {
  try {
    return resolveToken(token, record, records, parent, notFoundValue);
  } catch (e) {
    // ensure that 'e' is of type Error.
    if (!(e instanceof Error)) {
      e = new Error(e);
    }
    const path: any[] = e[TEMP_TOKEN_PATH] = e[TEMP_TOKEN_PATH] || [];
    path.unshift(token);
    if (record && record.value == CIRCULAR) {
      // Reset the Circular flag.
      record.value = EMPTY;
    }
    throw e;
  }
}

function resolveToken(
  token: any, record: Record | undefined, records: Map<any, Record>, parent: Injector,
  notFoundValue: any): any {
  let value;
  if (record) {
    // If we don't have a record, this implies that we don't own the provider hence don't know how
    // to resolve it.
    value = record.value;
    if (value == CIRCULAR) {
      throw Error(NO_NEW_LINE + 'Circular dependency');
    } else if (value === EMPTY) {
      record.value = CIRCULAR;
      let obj = undefined;
      let useNew = record.useNew;
      let fn = record.fn;
      let depRecords = record.deps;
      let deps = EMPTY;
      if (depRecords.length) {
        deps = [];
        for (let i = 0; i < depRecords.length; i++) {
          const depRecord: DependencyRecord = depRecords[i];
          const childRecord = records.get(depRecord.token);
          deps.push(tryResolveToken(
            // Current Token to resolve
            depRecord.token,
            // A record which describes how to resolve the token.
            // If undefined, this means we don't have such a record
            childRecord,
            // Other records we know about.
            records,

            // If we don't know how to resolve dependency and we should not check parent for it,
            // than pass in Null injector.
            // !childRecord ? NULL_INJECTOR : parent,

            // Changed this from the original angular version to parent
            // so we can search for dependency in parent injectory
            parent,

            Injector.THROW_IF_NOT_FOUND));
        }
      }
      record.value = value = useNew ? new (fn as any)(...deps) : fn.apply(obj, deps);
    }
  } else {
    value = parent.get(token, notFoundValue);
  }
  return value;
}

function computeDeps(provider: Provider): DependencyRecord[] {
  let deps: DependencyRecord[] = EMPTY;
  const providerDeps: any[] =
    (provider as ExistingProvider & ClassProvider & ConstructorProvider).deps;
  if (providerDeps && providerDeps.length) {
    deps = [];
    for (let i = 0; i < providerDeps.length; i++) {
      let token = resolveForwardRef(providerDeps[i]);
      deps.push({ token });
    }
  } else if ((provider as ExistingProvider).useExisting) {
    const token = resolveForwardRef((provider as ExistingProvider).useExisting);
    deps = [{ token }];
  } else if (!providerDeps && !(USE_VALUE in provider)) {
    // useValue & useExisting are the only ones which are exempt from deps all others need it.
    throw staticError('\'deps\' required', provider);
  }
  return deps;
}

function formatError(text: string, obj: any): string {
  text = text && text.charAt(0) === '\n' && text.charAt(1) == NO_NEW_LINE ? text.substr(2) : text;
  let context = stringify(obj);
  if (obj instanceof Array) {
    context = obj.map(stringify).join(' -> ');
  } else if (typeof obj === 'object') {
    let parts = <string[]>[];
    for (let key in obj) {
      if (obj.hasOwnProperty(key)) {
        let value = obj[key];
        parts.push(
          key + ':' + (typeof value === 'string' ? JSON.stringify(value) : stringify(value)));
      }
    }
    context = `{${parts.join(', ')}}`;
  }
  return `StaticInjectorError[${context}]: ${text.replace(NEW_LINE, '\n  ')}`;
}

function staticError(text: string, obj: any): Error {
  return new Error(formatError(text, obj));
}

function getClosureSafeProperty<T>(objWithPropertyToExtract: T): string {
  for (let key in objWithPropertyToExtract) {
    if (objWithPropertyToExtract[key] === GET_PROPERTY_NAME) {
      return key;
    }
  }
  throw Error('!prop');
}
