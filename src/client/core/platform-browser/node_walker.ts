import { Visitor } from '../linker/visitor';

export class NodeWalker {

  constructor() { }

  traverse(node: Node, visitor: Visitor) {

    let lclVisitor: Visitor | null;
    if (node instanceof Element) {
      lclVisitor = visitor.visitElement(node);
    } else if (node instanceof Text) {
    } else if (node instanceof Comment) {
    }

    // Check if context has changed and look up the corresponding
    // NodeVisitor if available
    if (!!lclVisitor && lclVisitor !== visitor) {

    } else {
      // Traverse through all the attributes of the node
      // if it is type of Element
      if (node instanceof Element && node.attributes.length) {
        for (let i = 0, max = node.attributes.length; i < max; i++) {
          visitor.visitAttribute(node, node.attributes[i]);
        }
      }
    }

    // Start traversing the child nodes
    let childNode = node.firstChild;
    if (childNode) {
      this.traverse(childNode, visitor);
      while (childNode = childNode.nextSibling) {
        this.traverse(childNode, visitor);
      }
    }
  }
}
