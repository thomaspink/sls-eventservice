import {ViewData} from '../view/types';

export abstract class Visitor {
  abstract visitElement(view: ViewData, el: any, name: string, attrs: [string, string, string][]|null,
    classNames: string[]|null): ViewData|null;
  abstract visitAttribute(view: ViewData, name: string, value: string|null): void;
  abstract finish(view: ViewData): void;
}
