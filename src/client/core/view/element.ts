import { ViewData, ViewDefinitionOld } from './types';

export function createElement(view: ViewData, renderHost: any, def: ViewDefinitionOld): any {
  const elDef = def.element!;
  const renderer = view.renderer;
  let el: any;
  if (view.parent) {
    if (elDef.name) {
      el = renderer.createElement(elDef.name, elDef.ns);
    } else {
      el = renderer.createComment('');
    }
    // const parentEl = getParentRenderElement(view, renderHost, def);
    if (renderHost) {
      renderer.appendChild(renderHost, el);
    }
  } else {
    el = renderer.selectRootElement(def.selector);
  }
  if (elDef.attrs) {
    for (let i = 0; i < elDef.attrs.length; i++) {
      const [ns, name, value] = elDef.attrs[i];
      renderer.setAttribute(el, name, value, ns);
    }
  }
  return el;
}
