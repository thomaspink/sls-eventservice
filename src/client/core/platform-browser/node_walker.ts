import {Visitor} from '../linker/visitor';

export class NodeWalker {
  traverse(node: Node, visitor: Visitor, context: any) {
    let contextHasChanged = false;

    // Skip SVGs for now
    // TODO @thomaspink: Implement SVG support (bindings, ...)
    if ((<any>node).tagName && (<any>node).tagName.toLowerCase() === 'svg')
      return;

    if (node instanceof Element) {
      const attributes = convertAttributes(node.attributes);
      const newContext = visitor.visitElement(context, node, node.tagName.toLowerCase(), attributes, node.className.split(' '));
      if (!!newContext && newContext !== context) {
        context = newContext;
        contextHasChanged = true;
      }
      if (node.attributes.length) {
        attributes.forEach(attr => {
          const [, name, value] = attr;
          if (name !== 'class' && name !== 'id')
            visitor.visitAttribute(context, name, value);
        });
      }
    }

    // Start traversing the child nodes
    let childNode = node.firstChild;
    if (childNode) {
      this.traverse(childNode, visitor, context);
      while (childNode = childNode.nextSibling) {
        this.traverse(childNode, visitor, context);
      }
    }

    if (contextHasChanged) {
      visitor.finish(context);
    }
  }
}

function convertAttributes(attributes: NodeListOf<Attr>) {
  const attrs: [string, string, string][] = [];
  for (let i = 0; i < attributes.length; i++) {
    var attr = attributes[i];
    attrs.push([attr.prefix, attr.name, attr.value]);
  }
  return attrs;
}
