import { Type, isType } from '../type';
import { stringify } from '../util';
import { ListWrapper } from '../util/collection';
import { NodeDef, NodeFlags, DepFlags, OutputDef, OutputType } from '../view/types';
import { componentDef, providerDef } from '../view/provider';
import { elementDef } from '../view/element';
import { viewDef } from '../view/view';

// Compiler Dependencies
import { splitAtColon } from '../compiler/util';
import { ComponentResolver } from '../compiler/component_resolver';
import { CssSelector } from '../compiler/selector';

import { CompileComponentMetadata, CompileProviderMetadata, CompileDiDependencyMetadata } from '../compiler/compile_metadata';

// type RawProvider = ValueProvider | ExistingProvider | FactoryProvider | ClassProvider | ConstructorProvider;
// type DepProvider = FactoryProvider | ClassProvider | ConstructorProvider;

export class ViewCompiler {
  constructor() {
  }

  compileComponent(component: CompileComponentMetadata) {
    const nodes: NodeDef[] = [];
    const providers = component.providers.map(provider => this._providerDef(provider));
    const selector = CssSelector.parse(component.selector)[0];
    nodes.push(...providers);

    const def = viewDef(nodes);
    // console.log(def);
  }

  private _providerDef(providerMeta: CompileProviderMetadata): NodeDef {
    let flags = NodeFlags.None;
    let value: any;
    let depMetas: CompileDiDependencyMetadata[];

    if (providerMeta.useClass) {
      flags |= NodeFlags.TypeClassProvider;
      value = providerMeta.useClass.reference;
      depMetas = providerMeta.deps || providerMeta.useClass!.diDeps;
    } else if(providerMeta.useFactory) {
      flags |= NodeFlags.TypeFactoryProvider;
      value = providerMeta.useFactory.reference;
      depMetas = providerMeta.deps || providerMeta.useFactory.diDeps;
    } else if(providerMeta.useExisting) {
      flags |= NodeFlags.TypeUseExistingProvider;
      // value = providerMeta.useExisting;
      depMetas = [{token: providerMeta.useExisting.identifier.reference || providerMeta.useExisting.identifier}];
    } else if(providerMeta.useValue) {
      flags |= NodeFlags.TypeValueProvider;
      value = providerMeta.useValue;
      depMetas = [];
    }

    const deps = depMetas.map(dep => this._depDef(dep));
    return providerDef(flags, [], providerMeta.token, value, deps);
  }

  private _depDef(dep: CompileDiDependencyMetadata) {
    let flags = DepFlags.None;
    if (dep.isSkipSelf) {
      flags |= DepFlags.SkipSelf;
    }
    if (dep.isOptional) {
      flags |= DepFlags.Optional;
    }
    if (dep.isValue) {
      flags |= DepFlags.Value;
    }
    return [flags, dep.token.identifier.reference || dep.token.identifier];
  }
}

interface ViewBuilderFactory {
  (parent: ViewBuilder): ViewBuilder;
}

class ViewBuilder {
  constructor(private parent: ViewBuilder|null, private component: CompileComponentMetadata) {
  }
}

export const VIEW_COMPILER_PROVIDER = {
  provide: ViewCompiler, deps: [] as any[]
}
