// import {Type, isType} from '../type';
// import {stringify} from '../util';
import {ListWrapper} from '../util/collection';
import {RendererType} from '../linker/renderer';
import {
  NodeDef, NodeFlags, DepFlags, QueryValueType, ElementHandleEventFn,
  ViewDefinitionFactory, BindingDef, BindingFlags
} from '../view/types';
import {componentDef, providerDef} from '../view/provider';
import {elementDef} from '../view/element';
import {textDef} from '../view/text';
import {viewDef} from '../view/view';

// Compiler Dependencies
// import {splitAtColon} from '../compiler/util';
import {NullTemplateVisitor, ElementAst, TextAst, TemplateAst, templateVisitAll} from '../compiler/template_parser/ast';
import {CssSelector} from '../compiler/selector';

import {
  CompileComponentMetadata, CompileProviderMetadata, CompileDiDependencyMetadata, CompileTemplateMetadata
} from '../compiler/compile_metadata';

// type RawProvider = ValueProvider | ExistingProvider | FactoryProvider | ClassProvider | ConstructorProvider;
// type DepProvider = FactoryProvider | ClassProvider | ConstructorProvider;

export class ViewCompiler {
  constructor() {
  }

  compileComponent(component: CompileComponentMetadata) {
    const nodes: NodeDef[] = [];

    console.log(component);

    // Element
    const selector = CssSelector.parse(component.selector)[0];
    const elDef = this._elementDef(NodeFlags.EmbeddedViews, [], 0, selector,
      component.hostListeners, component.hostProperties, component.hostAttributes, [], null,
      component.componentViewType, component.rendererType);
    nodes.push(elDef);

    // Component Provider
    const componentProvider = componentDef(0, [], 0, component.type.reference,
      component.type.diDeps.map(dep => this._depDef(dep)));
    elDef.element.componentProvider = componentProvider;
    nodes.push(componentProvider);

    // Providers
    const providers = component.providers.map(provider => this._providerDef(provider));
    nodes.push(...providers);

    // Template
    let templateNodes: NodeDef[] = [];
    if (component.template) {
      templateNodes = this._templateDef(component.template);
    } else {

    }
    (<any>elDef.element.componentView).setDelegate(() => viewDef(templateNodes));

    const def = viewDef(nodes);
    return def;
  }

  private _elementDef(flags: NodeFlags, matchedQueriesDsl: [string | number, QueryValueType][],
    childCount: number, selector: CssSelector, listeners: {[key: string]: string},
    properties: {[key: string]: string}, attributes: {[key: string]: string},
    outputs?: ([string, string])[], handleEvent?: ElementHandleEventFn,
    componentView?: ViewDefinitionFactory, componentRendererType?: RendererType | null): NodeDef {

    const name = selector.element || 'div';
    const fixedAttrs = selector.toAttrsList(true);
    const bindings: [BindingFlags, string, string][] = [];
    Object.keys(listeners).forEach(key => bindings.push([BindingFlags.TypeEvent, key, listeners[key]]));
    Object.keys(properties).forEach(key => bindings.push([BindingFlags.TypeProperty, key, listeners[key]]));
    Object.keys(attributes).forEach(key => bindings.push([BindingFlags.TypeElementAttribute, key, listeners[key]]));

    return elementDef(flags, matchedQueriesDsl, childCount, name, fixedAttrs, bindings,
      [], handleEvent, componentView, componentRendererType);
  }

  private _templateDef(templateMeta: CompileTemplateMetadata): NodeDef[] {
    return visitor.visitAll(templateMeta.htmlAst);
  }

  private _providerDef(providerMeta: CompileProviderMetadata): NodeDef {
    let flags = NodeFlags.None;
    let value: any;
    let depMetas: CompileDiDependencyMetadata[];

    if (providerMeta.useClass) {
      flags |= NodeFlags.TypeClassProvider;
      value = providerMeta.useClass.reference;
      depMetas = providerMeta.deps || providerMeta.useClass!.diDeps;
    } else if (providerMeta.useFactory) {
      flags |= NodeFlags.TypeFactoryProvider;
      value = providerMeta.useFactory.reference;
      depMetas = providerMeta.deps || providerMeta.useFactory.diDeps;
    } else if (providerMeta.useExisting) {
      flags |= NodeFlags.TypeUseExistingProvider;
      // value = providerMeta.useExisting;
      depMetas = [{
        token: providerMeta.useExisting.identifier.reference ||
        providerMeta.useExisting.identifier
      }];
    } else if (providerMeta.useValue) {
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

class TemplateVisitor extends NullTemplateVisitor {
  visitElement(ast: ElementAst, context: any): NodeDef[] {
    const attrs = ast.attrs.map(attr => [attr.name, attr.value] as [string, string]);
    const defs = [elementDef(0, [], ast.children.length, ast.name, attrs)];
    if (ast.children && ast.children.length)
      defs.push(...this.visitAll(ast.children));
    return defs;
  }
  visitText(ast: TextAst, context: any): NodeDef {
    return textDef([ast.value]);
  }

  visitAll(asts: TemplateAst[]) {
    return ListWrapper.flatten(templateVisitAll(this, asts)).filter(n => Boolean(n));
  }
}
const visitor = new TemplateVisitor();

export const VIEW_COMPILER_PROVIDER = {
  provide: ViewCompiler, deps: [] as any[]
};

