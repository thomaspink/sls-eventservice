import { Visitor } from '../linker/visitor';

export class NodeWalker {

  constructor() { }

  traverse(node: Node, visitor: Visitor, context: any) {
    let vis: Visitor | null = null;
    let ctx: any | null = null;
    if (node instanceof Element) {
      const result = visitor.visitElement(node, context);
      if (result) {
        if (!!result.visitor && result.visitor !== visitor) {
          visitor = result.visitor;
        }
        if (!!result.context && result.context !== context) {
          context = result.context;
        } else if (node.attributes.length) {
          for (let i = 0, max = node.attributes.length; i < max; i++) {
            visitor.visitAttribute(node, node.attributes[i], context);
          }
        }
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
  }
}
