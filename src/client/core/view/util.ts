import { Type } from '../type';
import { Injector } from '../di/injector';
import { createComponentView, initView } from './view';
import { ViewData, ViewDefinition } from './types';

export function createClass<C>(ctor: Type<C>, injector: Injector, deps: any[] = []): C {
  let resolvedDeps: any[] = [];
  if (deps && deps.length) {
    resolvedDeps = deps.map(dep => injector.get(dep));
  }
  const instance = new ctor(...resolvedDeps);
  return instance;
}

