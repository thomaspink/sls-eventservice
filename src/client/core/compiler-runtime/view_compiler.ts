import {Type} from '../type';
// import {stringify} from '../util';
import {ListWrapper} from '../util/collection';
import {RendererType} from '../linker/renderer';
import {
  NodeDef, NodeFlags, DepFlags, QueryValueType, ElementHandleEventFn,
  ViewDefinitionFactory, ViewDefinition, BindingFlags
} from '../view/types';
import {componentDef, providerDef} from '../view/provider';
import {elementDef} from '../view/element';
import {textDef} from '../view/text';
import {selectableDef} from '../view/selectable';
import {viewDef} from '../view/view';

// Compiler Dependencies
// import {splitAtColon} from '../compiler/util';
import {NullTemplateVisitor, ElementAst, TextAst, TemplateAst, templateVisitAll} from '../compiler/template_parser/ast';
import {CssSelector} from '../compiler/selector';

import {
  CompileComponentMetadata, CompileProviderMetadata, CompileDiDependencyMetadata
} from '../compiler/compile_metadata';

// type RawProvider = ValueProvider | ExistingProvider | FactoryProvider | ClassProvider | ConstructorProvider;
// type DepProvider = FactoryProvider | ClassProvider | ConstructorProvider;

export class ViewCompiler {

  private _hostDefs = new Map<Type<any>, ViewDefinition>();

  compileComponent(component: CompileComponentMetadata) {
    const nodes: NodeDef[] = [];
    const type = component.type.reference;

    let hostDef = this._hostDefs.get(type);
    if (hostDef) return hostDef;

    // Element
    const selector = CssSelector.parse(component.selector)[0];
    const elDef = this._elementDef(NodeFlags.EmbeddedViews, [], 0, selector,
      component.hostListeners, component.hostProperties, component.hostAttributes, [], null,
      component.componentViewType as any, component.rendererType);
    nodes.push(elDef);

    // Providers
    const providers = component.providers.map(provider => this._providerDef(provider));
    nodes.push(...providers);

    // Component Provider
    const componentProvider = componentDef(0, [], 0, type,
      component.type.diDeps.map(dep => this._depDef(dep)));
    elDef.element.componentProvider = componentProvider;
    nodes.push(componentProvider);

    // Template
    // let templateNodes: NodeDef[] = [];
    if (component.template) {
      // templateNodes = this._templateDef(component.template);
    } else {
      const viewDef = this._compileSelectableViewClass(component.childComponents);
      component.componentViewType.setDelegate(() => viewDef);
    }

    hostDef = viewDef(nodes);
    this._hostDefs.set(type, hostDef);
    return hostDef;
  }

  private _compileSelectableViewClass(childComponents: Type<any>[]) {
    const nodes: NodeDef[] = [];
    childComponents.forEach(comp => {
      const hostDef = this._hostDefs.get(comp);
      hostDef.nodes.forEach((node, index) => {
        const clone = Object.assign({}, node);
        if (clone.element && index === 0) {
          const classNames: string[] = [];
          const attrs: [string, string][] = [];
          clone.element.attrs.forEach(attr => {
            const [ns, name, value] = attr;
            const nsAndName = ns && ns.length ? `${ns}:${name}` : name;
            if (name === 'class') classNames.push(...value.split(''));
            else attrs.push([nsAndName, value]);
          });
          selectableDef(clone, clone.element.name, attrs, classNames, null);
        }
        clone.index = nodes.length;
        // TODO @thomaspink
        // recalculate node.bindingIndex and node.outputIndex
        nodes.push(clone);
      });
    });
    return viewDef(nodes);
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
    Object.keys(properties).forEach(key => bindings.push([BindingFlags.TypeProperty, key, properties[key]]));
    Object.keys(attributes).forEach(key => bindings.push([BindingFlags.TypeElementAttribute, key, attributes[key]]));

    return elementDef(flags, matchedQueriesDsl, childCount, name, fixedAttrs, bindings,
      [], handleEvent, componentView, componentRendererType);
  }

  // private _templateDef(templateMeta: CompileTemplateMetadata): NodeDef[] {
  //   return visitor.visitAll(templateMeta.htmlAst);
  // }

  // private _selectableDefs(children: CompileComponentMetadata[], bindings: {}) {
  //   const selectables: NodeDef[] = [];
  //   children.forEach(childComp => {
  //     const type = childComp.type.reference;
  //     const def = this._hostDefs.get(type);

  //     if (def.nodes) {
  //       const nodes: NodeDef[] = [];
  //       let elDef: NodeDef[];
  //       def.nodes.forEach(node => {
  //         if (node.element &&  node.index === 0 && node.element.componentView) {

  //         } else {
  //           const copy = Object.assign({}, node);
  //           copy.index = -1;
  //           nodes.push(copy);
  //         }
  //       });
  //     }
  //     // selectables.push(selectableDef(0, null, null, null, type, ));
  //   });
  //   Object.keys(bindings).forEach(sel => {
  //     const b = bindings[sel];
  //     let element = null;
  //     let attrs = null;
  //     let classNames = null;
  //     let ctor = null;
  //     if (typeof sel === 'string') {
  //       const s = CssSelector.parse(sel)[0];
  //       element = s.element;
  //       attrs = s.toAttrsList(false);
  //       classNames = s.classNames;
  //     } else if (typeof sel === 'function') {
  //       ctor = sel;
  //     }
  //     const selectorBindings: [BindingFlags, string, string][] = [];
  //     Object.keys(b.listeners).forEach(key => selectorBindings.push([BindingFlags.TypeEvent, key, b.listeners[key]]));
  //     Object.keys(b.properties).forEach(key => selectorBindings.push([BindingFlags.TypeProperty, key, b.properties[key]]));
  //     Object.keys(b.attributes).forEach(key => selectorBindings.push([BindingFlags.TypeElementAttribute, key, b.attributes[key]]));
  //     // selectables.push(selectableDef(0, element, attrs, classNames, ctor, selectorBindings));
  //   });
  //   return selectables;
  // }

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

