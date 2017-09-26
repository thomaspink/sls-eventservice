import {Type} from '../type';
import {MetadataResolver} from './metadata_resolver';
import {ViewCompiler} from './view_compiler';

import {SyncAsync} from '../compiler/util';
import {ProxyClass, CompileComponentMetadata} from '../compiler/compile_metadata';

import {CodegenComponentFactoryResolver} from '../linker/component_factory_resolver';

export class JitCompiler {
  constructor(private _metadataResolver: MetadataResolver, private _viewCompiler: ViewCompiler) {}

  compileComponentSync(componentType: Type<any>) {
    return SyncAsync.assertSync(this._compileRootComponent(componentType, true));
  }

  compileComponentAsync(componentType: Type<any>): Promise<object> {
    return Promise.resolve(this._compileRootComponent(componentType, false));
  }

  private _compileRootComponent(component: Type<any>, isSync: boolean) {
    const allComponentFactories: any[] = [];
    return SyncAsync.then(this._metadataResolver.loadComponentMetadata(component, isSync), _ => {
      this._compileComponent(component, allComponentFactories);
      return new CodegenComponentFactoryResolver(allComponentFactories, null);
    });
  }

  private _compileComponent(component: Type<any>, allComponentFactories: any[]|null) {
    const compMeta = this._metadataResolver.getComponentMetadata(component);
    if (allComponentFactories) {
      allComponentFactories.push(compMeta.componentFactory);
    }

    let childMetas: CompileComponentMetadata[] = [];
    if (compMeta.childComponents && compMeta.childComponents.length) {
      childMetas = compMeta.childComponents.map(c => {
        this._compileComponent(c, allComponentFactories);
        return this._metadataResolver.getComponentMetadata(c);
      });
    }
    const viewDef = this._viewCompiler.compileComponent(compMeta);
    (<ProxyClass>compMeta.componentFactory.viewDefFactory).setDelegate(() => viewDef);
  }
}

export const JIT_COMPILER_PROVIDER = {
  provide: JitCompiler, deps: [MetadataResolver, ViewCompiler]
};
