import { Type } from '../type';
import { stringify } from '../util';
import { Injector } from '../di/injector';
import { RendererType } from '../linker/renderer';
// import { createComponentView, initView } from './view';
import { Definition, DefinitionFactory, ViewData, DepFlags, DepDef, BindingDef, BindingFlags } from './types';

export const NOOP: any = () => {};

const _tokenKeyCache = new Map<any, string>();

export function tokenKey(token: any): string {
  let key = _tokenKeyCache.get(token);
  if (!key) {
    key = stringify(token) + '_' + _tokenKeyCache.size;
    _tokenKeyCache.set(token, key);
  }
  return key;
}

export function createClass<C>(ctor: Type<C>, injector: Injector, deps: any[] = []): C {
  let resolvedDeps: any[] = [];
  if (deps && deps.length) {
    resolvedDeps = deps.map(dep => injector.get(dep));
  }
  const instance = new ctor(...resolvedDeps);
  return instance;
}

export function isComponentView(view: ViewData): boolean {
  // return !!(view.def.nodeFlags & NodeFlags.Component);
  return true;
}

export function splitDepsDsl(deps: ([DepFlags, any] | any)[]): DepDef[] {
  return deps.map(value => {
    let token: any;
    let flags: DepFlags;
    if (Array.isArray(value)) {
      [flags, token] = value;
    } else {
      flags = DepFlags.None;
      token = value;
    }
    return {flags, token, tokenKey: tokenKey(token)};
  });
}

const DEFINITION_CACHE = new WeakMap<any, Definition<any>>();

export function resolveDefinition<D extends Definition<any>>(factory: DefinitionFactory<D>): D {
  let value = DEFINITION_CACHE.get(factory) !as D;
  if (!value) {
    value = factory();
    value.factory = factory;
    DEFINITION_CACHE.set(factory, value);
  }
  return value;
}

const NS_PREFIX_RE = /^:([^:]+):(.+)$/;

export function splitNamespace(name: string): string[] {
  if (name[0] === ':') {
    const match = name.match(NS_PREFIX_RE) !;
    return [match[1], match[2]];
  }
  return ['', name];
}

export function calcBindingFlags(bindings: BindingDef[]): BindingFlags {
  let flags = 0;
  for (let i = 0; i < bindings.length; i++) {
    flags |= bindings[i].flags;
  }
  return flags;
}

const UNDEFINED_RENDERER_TYPE_ID = '$$undefined';
const EMPTY_RENDERER_TYPE_ID = '$$empty';
let _renderCompCount = 0;
export function resolveRendererType(type?: RendererType | null): RendererType|null {
  if (type && type.id === UNDEFINED_RENDERER_TYPE_ID) {
    // first time we see this RendererType2. Initialize it...
    const isFilled = Object.keys(type.data).length;
    if (isFilled) {
      type.id = `c${_renderCompCount++}`;
    } else {
      type.id = EMPTY_RENDERER_TYPE_ID;
    }
  }
  if (type && type.id === EMPTY_RENDERER_TYPE_ID) {
    type = null;
  }
  return type || null;
}
