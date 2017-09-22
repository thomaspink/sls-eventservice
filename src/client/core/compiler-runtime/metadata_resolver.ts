import {Type, isType} from '../type';
import {stringify} from '../util';
import {ListWrapper} from '../util/collection';
import {Reflector} from '../reflection/reflector';
import {Component} from '../metadata/components';
import {Optional, SkipSelf, Self, Host} from '../di/metadata';
import {resolveForwardRef} from '../di/forward_ref';
import {Provider} from '../di/provider';
import {createComponentFactory} from '../view/refs';

// Compiler Dependencies
import {ComponentResolver} from '../compiler/component_resolver';
import {SyncAsync, noUndefined} from '../compiler/util';
import {
  CompileComponentMetadata, CompileProviderMetadata, CompileDiDependencyMetadata, CompileTypeMetadata,
  CompileFactoryMetadata, CompileTokenMetadata, CompileIdentifierMetadata, ProviderMeta, ProxyClass,
  viewClassName, hostViewClassName, CompileTemplateMetadata
} from '../compiler/compile_metadata';
import {TemplateParser, TemplateParseResult} from '../compiler/template_parser/parser';

export class MetadataResolver {
  private _nonNormalizedComponentCache = new Map<Type<any>, CompileComponentMetadata>();
  private _componentCache = new Map<Type<any>, CompileComponentMetadata>();

  constructor(private _componentResolver: ComponentResolver, private _reflector: Reflector,
    private _templateParser: TemplateParser) {}

  getComponentMetadata(componentType: any): CompileComponentMetadata {
    const dirMeta = this._componentCache.get(componentType)!;
    if (!dirMeta) {
      throw new Error(
        `Illegal state: getComponentMetadata can only be called after loadComponentMetadata. Component ${stringify(componentType)}.`);
    }
    return dirMeta;
  }

  loadComponentMetadata(componentType: any, isSync: boolean): SyncAsync<null> {
    if (this._componentCache.has(componentType)) {
      return null;
    }
    componentType = resolveForwardRef(componentType);
    const metadata = this.getNonNormalizedComponentMetadata(componentType)!;

    const createComponentMetadata = (templateMetadata: CompileTemplateMetadata | null): null => {
      const normalizedCompMeta = new CompileComponentMetadata({
        type: metadata.type,
        selector: metadata.selector,
        // changeDetection: metadata.changeDetection,
        inputs: metadata.inputs,
        outputs: metadata.outputs,
        hostListeners: metadata.hostListeners,
        hostProperties: metadata.hostProperties,
        hostAttributes: metadata.hostAttributes,
        providers: metadata.providers,
        viewProviders: metadata.viewProviders,
        // queries: metadata.queries,
        // viewQueries: metadata.viewQueries,
        componentViewType: metadata.componentViewType,
        // rendererType: metadata.rendererType,
        componentFactory: metadata.componentFactory,
        template: templateMetadata,
        childComponents: ListWrapper.flatten(metadata.childComponents)
      });
      this._componentCache.set(componentType, normalizedCompMeta);
      return null;
    };

    let childMetas: (Promise<null>|null)[] = [];
    if (metadata.childComponents && metadata.childComponents.length) {
      childMetas = ListWrapper.flatten(metadata.childComponents).map(t => this.loadComponentMetadata(t, isSync));
    }

    let templateMeta: CompileTemplateMetadata|null = null;
    const template = metadata.template !;
    if (template && template.template) {
      let templateParseResult: TemplateParseResult;
      templateParseResult = this._templateParser.parse(template.template, stringify(componentType));
      templateMeta = new CompileTemplateMetadata({
        template: template.template,
        htmlAst: noUndefined(templateParseResult.templateAst)
      });
    }

    return SyncAsync.then(SyncAsync.then(SyncAsync.all(childMetas), _ => templateMeta), createComponentMetadata);
  }

  getNonNormalizedComponentMetadata(componentType: any): CompileComponentMetadata | null {
    componentType = resolveForwardRef(componentType);
    if (!componentType) {
      return null;
    }
    let cacheEntry = this._nonNormalizedComponentCache.get(componentType);
    if (cacheEntry) {
      return cacheEntry;
    }
    const compMeta = this._componentResolver.resolve(componentType, false);
    if (!compMeta) {
      return null;
    }
    let nonNormalizedTemplateMetadata: CompileTemplateMetadata = undefined!;
    nonNormalizedTemplateMetadata = new CompileTemplateMetadata({
      template: noUndefined(compMeta.template),
      htmlAst: null
    });

    // let changeDetectionStrategy: ChangeDetectionStrategy = compMeta.changeDetection!!;
    let viewProviders: CompileProviderMetadata[] = [];
    let selector = compMeta.selector;

    if (compMeta.viewProviders && compMeta.viewProviders.length) {
      viewProviders = this._getProvidersMetadata(compMeta.viewProviders,
        `viewProviders for "${stringify(componentType)}"`, []);
    }
    if (!selector) {
      throw new Error(`Component ${stringify(componentType)} has no selector, please add it!`);
    }

    let providers: CompileProviderMetadata[] = [];
    if (compMeta.providers && compMeta.providers.length) {
      providers = this._getProvidersMetadata(compMeta.providers,
        `providers for "${stringify(componentType)}"`, []);
    }
    // let queries: CompileQueryMetadata[] = [];
    // let viewQueries: CompileQueryMetadata[] = [];
    // if (compMeta.queries != null) {
    // queries = this._getQueriesMetadata(compMeta.queries, false, componentType);
    // viewQueries = this._getQueriesMetadata(compMeta.queries, true, componentType);
    // }

    const metadata = CompileComponentMetadata.create({
      selector: selector,
      type: this._getTypeMetadata(componentType, compMeta.deps),
      template: nonNormalizedTemplateMetadata,
      // changeDetection: changeDetectionStrategy,
      inputs: /*compMeta.inputs || */[],
      outputs: compMeta.outputs || [],
      host: compMeta.host || {},
      providers: providers || [],
      viewProviders: viewProviders || [],
      // queries: queries || [],
      // viewQueries: viewQueries || [],
      componentViewType: this.getComponentViewClass(componentType),
      // rendererType: nonNormalizedTemplateMetadata ? this.getRendererType(componentType) : null,
      componentFactory: null,
      childComponents: compMeta.components as Type<any>[] || []
    });
    metadata.componentFactory =
      this.getComponentFactory(selector, componentType, metadata.inputs, metadata.outputs);
    this._nonNormalizedComponentCache.set(componentType, metadata);
    return metadata;
  }

  getProviderMetadata(provider: ProviderMeta): CompileProviderMetadata {
    let compileDeps: CompileDiDependencyMetadata[] = undefined!;
    let compileTypeMetadata: CompileTypeMetadata = null!;
    let compileFactoryMetadata: CompileFactoryMetadata = null!;
    let token: CompileTokenMetadata = this._getTokenMetadata(provider.token);

    if (provider.useClass) {
      compileTypeMetadata = this._getTypeMetadata(provider.useClass, provider.dependencies);
      compileDeps = compileTypeMetadata.diDeps;
      if (provider.token === provider.useClass) {
        // use the compileTypeMetadata as it contains information about lifecycleHooks...
        token = {identifier: compileTypeMetadata};
      }
    } else if (provider.useFactory) {
      compileFactoryMetadata = this._getFactoryMetadata(provider.useFactory, provider.dependencies);
      compileDeps = compileFactoryMetadata.diDeps;
    }

    return {
      token: token,
      useClass: compileTypeMetadata,
      useValue: provider.useValue,
      useFactory: compileFactoryMetadata,
      useExisting: provider.useExisting ? this._getTokenMetadata(provider.useExisting) : undefined,
      deps: compileDeps,
      multi: provider.multi
    };
  }

  private getComponentFactory(
    selector: string, compType: any, inputs: {[key: string]: string} | null,
    outputs: {[key: string]: string}): any {
    const hostView = this.getHostComponentViewClass(compType);
    return createComponentFactory(selector, compType, <any>hostView, inputs, outputs, []);
  }

  private _createProxyClass(baseType: any, name: string): ProxyClass {
    let delegate: any = null;
    const proxyClass: ProxyClass = <any>function() {
      if (!delegate) {
        throw new Error(
          `Illegal state: Class ${name} for type ${stringify(baseType)} is not compiled yet!`);
      }
      return delegate.apply(this, arguments);
    };
    proxyClass.setDelegate = (d) => {
      delegate = d;
      (<any>proxyClass).prototype = d.prototype;
    };
    // Make stringify work correctly
    (<any>proxyClass).overriddenName = name;
    return proxyClass;
  }

  private getGeneratedClass(dirType: any, name: string): ProxyClass {
    return this._createProxyClass(dirType, name);
  }

  private getComponentViewClass(compType: any): ProxyClass {
    return this.getGeneratedClass(compType, viewClassName(compType, 0));
  }

  getHostComponentViewClass(compType: any): ProxyClass {
    return this.getGeneratedClass(compType, hostViewClassName(compType));
  }

  private _getProvidersMetadata(providers: Provider[], debugInfo?: string,
    compileProviders: CompileProviderMetadata[] = []) {
    providers.forEach((provider: any, providerIdx: number) => {
      if (Array.isArray(provider)) {
        this._getProvidersMetadata(provider, debugInfo, compileProviders);
      } else {
        provider = resolveForwardRef(provider);
        let providerMeta: ProviderMeta = undefined!;
        if (provider && typeof provider === 'object' && provider.hasOwnProperty('provide')) {
          this._validateProvider(provider);
          if (isType(provider.provide) &&
            !(provider.hasOwnProperty('useClass') || provider.hasOwnProperty('useFactory') ||
              provider.hasOwnProperty('useExisting') || provider.hasOwnProperty('useValue'))) {
            provider.useClass = provider.provide;
          }
          providerMeta = new ProviderMeta(provider.provide, provider);
        } else if (isType(provider)) {
          providerMeta = new ProviderMeta(provider, {useClass: provider});
        } else if (provider === void 0) {
          throw new Error(`Encountered undefined provider! Usually this means you have ` +
            `a circular dependencies (might be caused by using 'barrel' index.ts files.`);
        } else {
          const providersInfo =
            (<string[]>providers.reduce(
              (soFar: string[], seenProvider: any, seenProviderIdx: number) => {
                if (seenProviderIdx < providerIdx) {
                  soFar.push(`${stringify(seenProvider)}`);
                } else if (seenProviderIdx == providerIdx) {
                  soFar.push(`?${stringify(seenProvider)}?`);
                } else if (seenProviderIdx == providerIdx + 1) {
                  soFar.push('...');
                }
                return soFar;
              },
              []))
              .join(', ');
          throw new Error(
            `Invalid ${debugInfo ? debugInfo : 'provider'} - only instances of Provider and Type are allowed, got: [${providersInfo}]`);
        }
        compileProviders.push(this.getProviderMetadata(providerMeta));
      }
    });
    return compileProviders;
  }

  private _getTypeMetadata(type: Type<any>,
    dependencies: any[] | null = null): CompileTypeMetadata {
    const identifier = this._getIdentifierMetadata(type);
    return {
      reference: identifier.reference,
      diDeps: this._getDependenciesMetadata(identifier.reference, dependencies),
      // lifecycleHooks: getAllLifecycleHooks(this._reflector, identifier.reference),
    };
  }

  private _getFactoryMetadata(factory: Function, dependencies: any[] | null = null):
    CompileFactoryMetadata {
    factory = resolveForwardRef(factory);
    return {reference: factory, diDeps: this._getDependenciesMetadata(factory, dependencies)};
  }

  private _getIdentifierMetadata(type: Type<any>): CompileIdentifierMetadata {
    type = resolveForwardRef(type);
    return {reference: type};
  }

  private _getDependenciesMetadata(typeOrFunc: Type<any> | Function, dependencies: any[] | null) {
    const params = dependencies || this._reflector.parameters(typeOrFunc as any) || [];
    let hasUnknownDeps = false;

    const dependenciesMetadata = params.map((param) => {
      let isAttribute = false;
      let isHost = false;
      let isSelf = false;
      let isSkipSelf = false;
      let isOptional = false;
      let token: any = null;
      if (Array.isArray(param)) {
        param.forEach((paramEntry) => {
          if (isTypeOf(paramEntry, Host)) {
            isHost = true;
          } else if (isTypeOf(paramEntry, Self)) {
            isSelf = true;
          } else if (isTypeOf(paramEntry, SkipSelf)) {
            isSkipSelf = true;
          } else if (isTypeOf(paramEntry, Optional)) {
            isOptional = true;
            // } else if (isTypeOf(paramEntry, Host)) {
            //   isAttribute = true;
            //   token = paramEntry.attributeName;
            // } else if (isTypeOf(paramEntry, Inject)) {
            //   token = paramEntry.token;
            // } else if (isTypeOf(paramEntry, InjectionToken) || paramEntry instanceof StaticSymbol) {
            //   token = paramEntry;
          } else if (token == null) {
            token = paramEntry;
          }
        });
      } else {
        token = param;
      }
      if (token == null) {
        hasUnknownDeps = true;
        return null!;
      }

      return {
        isAttribute,
        isHost,
        isSelf,
        isSkipSelf,
        isOptional,
        token: this._getTokenMetadata(token)
      };

    });

    if (hasUnknownDeps) {
      const depsTokens = dependenciesMetadata.map((dep) => dep ? stringify(dep.token) : '?').join(', ');
      throw new Error(`Can't resolve all parameters for ${stringify(typeOrFunc)}: (${depsTokens}).`);
    }

    return dependenciesMetadata;
  }

  private _validateProvider(provider: any): void {
    if (provider.hasOwnProperty('useClass') && provider.useClass == null) {
      throw new Error(
        `Invalid provider for ${stringify(provider.provide)}. useClass cannot be ${provider.useClass}.
           Usually it happens when:
           1. There's a circular dependency (might be caused by using index.ts (barrel) files).
           2. Class was used before it was declared. Use forwardRef in this case.`);
    }
  }

  private _getTokenMetadata(token: any): CompileTokenMetadata {
    token = resolveForwardRef(token);
    let compileToken: CompileTokenMetadata;
    if (typeof token === 'string') {
      compileToken = {value: token};
    } else {
      compileToken = {identifier: {reference: token}};
    }
    return compileToken;
  }
}

function isTypeOf(instance: any, type: Type<any>): boolean {
  return instance instanceof type;
}

export const METADATA_RESOLVER_PROVIDER = {
  provide: MetadataResolver, deps: [ComponentResolver, Reflector, TemplateParser]
};
