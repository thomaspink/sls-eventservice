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

import { CompileComponentMetadata } from '../compiler/compile_metadata';

// type RawProvider = ValueProvider | ExistingProvider | FactoryProvider | ClassProvider | ConstructorProvider;
// type DepProvider = FactoryProvider | ClassProvider | ConstructorProvider;

export class ViewCompiler {
  constructor() {
  }

  compileComponent(component: CompileComponentMetadata) {


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
