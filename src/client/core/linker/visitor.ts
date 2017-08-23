export abstract class Visitor {
  abstract visitElement(element: any): Visitor | null;
  abstract visitAttribute(element: any, attribute: any): Visitor | null;
}
