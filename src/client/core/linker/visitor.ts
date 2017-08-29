export abstract class Visitor {
  abstract visitElement(element: any, context: any):
    { visitor: Visitor  | null, context: any | null } | null;
  abstract visitAttribute(element: any, attribute: any, context: any): void;
  abstract finish(context: any): void;
}
