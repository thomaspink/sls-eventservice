import { Renderer } from '../linker/renderer';
// import {
//   TemplateTypes, TemplateAttributeDef, TemplateElementDef, TemplateEOFDef,
//   TemplateNodeDef, TemplateTextDef, TeplateCommentDef
// } from './types';


export class TemplateRenderer {
  // constructor(private _nodes: TemplateNodeDef[], private _renderer: Renderer) { }

  render() {
    // const root = this._renderer.createElement('div');
    // if (this._nodes && this._nodes.length) {

      // this._renderNodes(this._nodes, root)
    // }
    // return root;
  }

  // private _renderNodes(nodes: TemplateNodeDef[], parent?: Element) {
    // return nodes.map(node => {
    //   switch (node[0]) {
    //     case TemplateTypes.Element:
    //       return this._renderElement(node as TemplateElementDef, parent);
    //     case TemplateTypes.Text:
    //       return this._renderText(node as TemplateTextDef, parent);
    //     case TemplateTypes.Comment:
    //       return this._renderComment(node as TeplateCommentDef, parent);
    //     case TemplateTypes.Attribute:
    //       throw new Error('Attributes are only allowed in elements!');
    //   }
    // });
  // }

  // private _renderElement(node: TemplateElementDef, parent?: Element): Element {
  //   const el = this._renderer.createElement(node[1]);
  //   const attrNodes = node[2];
  //   const childNodes = node[3];
  //   if (attrNodes && attrNodes.length) {
  //     attrNodes.forEach((a: TemplateAttributeDef) => {
  //       this._renderer.setAttribute(el, a[1], a[2]);
  //     });
  //   }
  //   if (childNodes && childNodes.length) this._renderNodes(childNodes, el);
  //   if (parent) this._renderer.appendChild(parent, el);
  //   return el;
  // }

  // private _renderText(node: TemplateTextDef, parent?: Element): Text {
  //   const text = this._renderer.createText(node[1]);
  //   if (parent) this._renderer.appendChild(parent, text);
  //   return text;
  // }

  // private _renderComment(node: TeplateCommentDef, parent?: Element): Comment  {
  //   const comment = this._renderer.createComment(node[1]);
  //   if (parent) this._renderer.appendChild(parent, comment);
  //   return comment;
  // }
}
