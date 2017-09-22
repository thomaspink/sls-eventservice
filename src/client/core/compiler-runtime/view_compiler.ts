// import {Type, isType} from '../type';
// import {stringify} from '../util';
// import {ListWrapper} from '../util/collection';
import {NodeDef, NodeFlags, DepFlags, OutputDef, OutputType} from '../view/types';
import {componentDef, providerDef} from '../view/provider';
import {elementDef} from '../view/element';
import {viewDef} from '../view/view';

// Compiler Dependencies
// import {splitAtColon} from '../compiler/util';
import {NullTemplateVisitor, ElementAst, templateVisitAll} from '../compiler/template_parser/ast';
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
    console.log(component);
    const nodes: NodeDef[] = [];

    // Element
    const selector = CssSelector.parse(component.selector)[0];
    nodes.push(elementDef(0, [], 0, selector.element || 'div', selector.toAttrsList(true), [], [], null, ));

    // Component Provider
    const compDef = componentDef(0, [], 0, component.type.reference,
      component.type.diDeps.map(dep => this._depDef(dep)));
    nodes.push(compDef);

    // Providers
    const providers = component.providers.map(provider => this._providerDef(provider));
    nodes.push(...providers);

    // Template
    if (component.template) {
      nodes.push(...this._templateDef(component.template));
    }

    const def = viewDef(nodes);
    console.log(def);
    return def;
  }

  private _templateDef(templateMeta: CompileTemplateMetadata): NodeDef[] {
    return templateVisitAll(visitor, templateMeta.htmlAst).filter(n => Boolean(n));
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
    const defs =  [elementDef(0, [], ast.children.length, ast.name, attrs)];
    if (ast.children && ast.children.length)
      defs.push(...templateVisitAll(this, ast.children));
    return defs;
  }
}
const visitor = new TemplateVisitor();

export const VIEW_COMPILER_PROVIDER = {
  provide: ViewCompiler, deps: [] as any[]
};

