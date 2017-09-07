import { Type } from '../type';
import { SyncAsync } from '../compiler/util';
import { ListWrapper } from '../util/collection';
import { MetadataResolver } from './metadata_resolver';
import { ViewCompiler } from './view_compiler';

export class JitCompiler {
  constructor(private _metadataResolver: MetadataResolver, private _viewCompiler: ViewCompiler) { }

  compileComponentSync(componentType: Type<any>) {
    return SyncAsync.assertSync(this._compileComponent(componentType, [], true));
  }

  compileComponentAsync(componentType: Type<any>): Promise<object> {
    return Promise.resolve(this._compileComponent(componentType, [], false));
  }

  private _compileComponent(component: Type<any>, allComponentFactories: object[] | null, isSync: boolean) {
    return SyncAsync.then(this._loadComponent(component, isSync), _ => {
      console.log(this._metadataResolver.getComponentMetadata(component));
      return {};
    });
  }

  private _loadComponent(component: Type<any>, isSync: boolean): SyncAsync<any> {
      return this._metadataResolver.loadComponentMetadata(component, isSync);
  }

}

export const JIT_COMPILER_PROVIDER = {
  provide: JitCompiler, deps: [MetadataResolver, ViewCompiler]
}
