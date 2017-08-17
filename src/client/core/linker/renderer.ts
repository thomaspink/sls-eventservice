export abstract class RootRenderer {
  abstract findElements(selector: string, root?: Document | Element): Element[];
  abstract findElement(selector: string, root?: Document | Element): Element | null;
}

export abstract class Renderer {
  abstract findElements(selector: string): Element[];
  abstract findElement(selector: string): Element | null;
  abstract listen(target: 'window' | 'document' | 'body' | any, event: string,
    callback: (event: any) => boolean | void): () => void;
}
