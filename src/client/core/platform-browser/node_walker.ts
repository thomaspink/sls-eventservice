import { Visitor } from '../linker/visitor';

export class NodeWalker {
  traverse(node: Node, visitor: Visitor, context: any) {
    let contextHasChanged = false;
    if (node instanceof Element) {
      const result = visitor.visitElement(node, context);
      if (result) {
        if (!!result.visitor && result.visitor !== visitor) {
          visitor = result.visitor;
        }
        if (!!result.context && result.context !== context) {
          context = result.context;
          contextHasChanged = true;
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

    if(contextHasChanged) {
      visitor.finish(context);
    }
  }
}
