export function querySelectorAll(selector: string, root: Document|Element = document): Node[] {
  return [].slice.call(root.querySelectorAll(selector));
}
