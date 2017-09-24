import {stringify} from '../util';
import {splitAtColon} from './util';
import {Type} from '../type';
import {TemplateAst} from './template_parser/ast';

// group 0: "[prop] or (event) or @trigger"
// group 1: "prop" from "[prop]"
// group 2: "event" from "(event)"
// group 3: "@trigger" from "@trigger"
const HOST_REG_EXP = /^(?:(?:\[([^\]]+)\])|(?:\(([^\)]+)\)))|(\@[-\w]+)$/;

/**
 * Metadata regarding compilation of a component.
 */
export class CompileComponentMetadata {
  static create({type, selector,/* changeDetection,*/ inputs, outputs,
    host, bindings, providers, viewProviders,/* queries, viewQueries,*/ template,
    componentViewType, rendererType, componentFactory,
    childComponents}: {
      type: CompileTypeMetadata,
      selector: string | null,
      // changeDetection: ChangeDetectionStrategy|null,
      inputs: string[],
      outputs: string[],
      host: {[key: string]: string},
      bindings: {[selector: string]: {[key: string]: string}},
      providers: CompileProviderMetadata[],
      viewProviders: CompileProviderMetadata[],
      // queries: CompileQueryMetadata[],
      // viewQueries: CompileQueryMetadata[],
      template: CompileTemplateMetadata,
      componentViewType: any | null,
      rendererType: any|object|null,
      componentFactory: any | object | null,

      childComponents: Type<any>[];
    }): CompileComponentMetadata {
    const hostListeners: {[key: string]: string} = {};
    const hostProperties: {[key: string]: string} = {};
    const hostAttributes: {[key: string]: string} = {};
    if (host != null) {
      Object.keys(host).forEach(key => {
        const value = host[key];
        const matches = key.match(HOST_REG_EXP);
        if (matches === null) {
          hostAttributes[key] = value;
        } else if (matches[1] != null) {
          hostProperties[matches[1]] = value;
        } else if (matches[2] != null) {
          hostListeners[matches[2]] = value;
        }
      });
    }
    const childBindings: {[selector: string]: {
      listeners: {[key: string]: string},
      properties: {[key: string]: string},
      attributes: {[key: string]: string}
    }} = {};
    if (bindings != null) {
      Object.keys(bindings).forEach(selctr => {
        const binding = bindings[selctr];
        const listeners: {[key: string]: string} = {};
        const properties: {[key: string]: string} = {};
        const attributes: {[key: string]: string} = {};
        Object.keys(binding).forEach(key => {
          const value = binding[key];
          const matches = key.match(HOST_REG_EXP);
          if (matches === null) {
            attributes[key] = value;
          } else if (matches[1] != null) {
            properties[matches[1]] = value;
          } else if (matches[2] != null) {
            listeners[matches[2]] = value;
          }
        });
        childBindings[selctr] = {listeners, properties, attributes};
      });
    }
    const inputsMap: {[key: string]: string} = {};
    if (inputs != null) {
      inputs.forEach((bindConfig: string) => {
        // canonical syntax: `dirProp: elProp`
        // if there is no `:`, use dirProp = elProp
        const parts = splitAtColon(bindConfig, [bindConfig, bindConfig]);
        inputsMap[parts[0]] = parts[1];
      });
    }
    const outputsMap: {[key: string]: string} = {};
    if (outputs != null) {
      outputs.forEach((bindConfig: string) => {
        // canonical syntax: `dirProp: elProp`
        // if there is no `:`, use dirProp = elProp
        const parts = splitAtColon(bindConfig, [bindConfig, bindConfig]);
        outputsMap[parts[0]] = parts[1];
      });
    }

    return new CompileComponentMetadata({
      type,
      selector,
      // changeDetection,
      inputs: inputsMap,
      outputs: outputsMap,
      hostListeners,
      hostProperties,
      hostAttributes,
      bindings: childBindings,
      providers,
      viewProviders,
      // queries,
      // viewQueries,
      template,
      componentViewType,
      rendererType,
      componentFactory,
      childComponents
    });
  }

  type: CompileTypeMetadata;
  selector: string | null;
  // changeDetection: ChangeDetectionStrategy|null;
  inputs: {[key: string]: string};
  outputs: {[key: string]: string};
  hostListeners: {[key: string]: string};
  hostProperties: {[key: string]: string};
  hostAttributes: {[key: string]: string};
  bindings: {[selector: string]: {
    listeners: {[key: string]: string},
    properties: {[key: string]: string},
    attributes: {[key: string]: string}
  }};
  providers: CompileProviderMetadata[];
  viewProviders: CompileProviderMetadata[];
  // queries: CompileQueryMetadata[];
  // viewQueries: CompileQueryMetadata[];

  template: CompileTemplateMetadata | null;

  componentViewType: any | null;
  rendererType: any|object|null;
  componentFactory: any | object | null;

  childComponents: Type<any>[];

  constructor({type, selector, /*changeDetection,*/ inputs, outputs, hostListeners, hostProperties,
    hostAttributes, bindings, providers, viewProviders, /*queries, viewQueries,*/ template,
    componentViewType, rendererType, componentFactory, childComponents}: {
      type: CompileTypeMetadata,
      selector: string | null,
      // changeDetection: ChangeDetectionStrategy|null,
      inputs: {[key: string]: string},
      outputs: {[key: string]: string},
      hostListeners: {[key: string]: string},
      hostProperties: {[key: string]: string},
      hostAttributes: {[key: string]: string},
      bindings: {[selector: string]: {
        listeners: {[key: string]: string},
        properties: {[key: string]: string},
        attributes: {[key: string]: string}
      }},
      providers: CompileProviderMetadata[],
      viewProviders: CompileProviderMetadata[],
      // queries: CompileQueryMetadata[],
      // viewQueries: CompileQueryMetadata[],
      template: CompileTemplateMetadata | null,
      componentViewType: any | null,
      rendererType: any | object | null,
      componentFactory: any | object | null,
      childComponents: Type<any>[],
    }) {
    this.type = type;
    this.selector = selector;
    // this.changeDetection = changeDetection;
    this.inputs = inputs;
    this.outputs = outputs;
    this.hostListeners = hostListeners;
    this.hostProperties = hostProperties;
    this.hostAttributes = hostAttributes;
    this.bindings = bindings;
    this.providers = _normalizeArray(providers);
    this.viewProviders = _normalizeArray(viewProviders);
    // this.queries = _normalizeArray(queries);
    // this.viewQueries = _normalizeArray(viewQueries);
    this.template = template;

    this.componentViewType = componentViewType;
    // this.rendererType = rendererType;
    this.componentFactory = componentFactory;

    this.childComponents = childComponents;
  }
}

/**
 * Metadata regarding compilation of a template.
 */
export class CompileTemplateMetadata {
  template: string | null;
  htmlAst: TemplateAst[] | null;
  constructor({template, htmlAst}: {
    template: string | null,
    htmlAst: TemplateAst[] | null,
  }) {
    this.template = template;
    this.htmlAst = htmlAst;
  }
}

export class ProviderMeta {
  token: any;
  useClass: Type<any> | null;
  useValue: any;
  useExisting: any;
  useFactory: Function | null;
  dependencies: Object[] | null;
  multi: boolean;

  constructor(token: any, {useClass, useValue, useExisting, useFactory, deps, multi}: {
    useClass?: Type<any>,
    useValue?: any,
    useExisting?: any,
    useFactory?: Function | null,
    deps?: Object[] | null,
    multi?: boolean
  }) {
    this.token = token;
    this.useClass = useClass || null;
    this.useValue = useValue;
    this.useExisting = useExisting;
    this.useFactory = useFactory || null;
    this.dependencies = deps || null;
    this.multi = !!multi;
  }
}

export interface CompileIdentifierMetadata {reference: any;}

export interface CompileProviderMetadata {
  token: CompileTokenMetadata;
  useClass?: CompileTypeMetadata;
  useValue?: any;
  useExisting?: CompileTokenMetadata;
  useFactory?: CompileFactoryMetadata;
  deps?: CompileDiDependencyMetadata[];
  multi?: boolean;
}

export interface CompileTokenMetadata {
  value?: any;
  identifier?: any;
}

export interface CompileTypeMetadata extends CompileIdentifierMetadata {
  diDeps: CompileDiDependencyMetadata[];
  // lifecycleHooks: LifecycleHooks[];
  reference: any;
}

export interface CompileFactoryMetadata extends CompileIdentifierMetadata {
  diDeps: CompileDiDependencyMetadata[];
  reference: any;
}

export interface CompileDiDependencyMetadata {
  isAttribute?: boolean;
  isSelf?: boolean;
  isSkipSelf?: boolean;
  isOptional?: boolean;
  isValue?: boolean;
  token?: CompileTokenMetadata;
  value?: any;
}

export function viewClassName(compType: any, embeddedTemplateIndex: number): string {
  return `View_${identifierName({reference: compType})}_${embeddedTemplateIndex}`;
}

export function rendererTypeName(compType: any): string {
  return `RenderType_${identifierName({reference: compType})}`;
}

export function hostViewClassName(compType: any): string {
  return `HostView_${identifierName({reference: compType})}`;
}

export function componentFactoryName(compType: any): string {
  return `${identifierName({reference: compType})}NgFactory`;
}

export interface ProxyClass {setDelegate(delegate: any): void;}

function _normalizeArray(obj: any[] | undefined | null): any[] {
  return obj || [];
}

function _sanitizeIdentifier(name: string): string {
  return name.replace(/\W/g, '_');
}

let _anonymousTypeIndex = 0;

export function identifierName(compileIdentifier: CompileIdentifierMetadata | null | undefined):
  string | null {
  if (!compileIdentifier || !compileIdentifier.reference) {
    return null;
  }
  const ref = compileIdentifier.reference;
  if (ref['__anonymousType']) {
    return ref['__anonymousType'];
  }
  let identifier = stringify(ref);
  if (identifier.indexOf('(') >= 0) {
    // case: anonymous functions!
    identifier = `anonymous_${_anonymousTypeIndex++}`;
    ref['__anonymousType'] = identifier;
  } else {
    identifier = _sanitizeIdentifier(identifier);
  }
  return identifier;
}
