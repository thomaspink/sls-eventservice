import {TemplateAst} from './ast';

export class TemplateParseResult {
  constructor(public templateAst?: TemplateAst[], public errors?: TemplateParseError[]) { }
}

export class TemplateParseError extends Error {
  constructor(msg: string, file: string) {
    super(`Template Parse Error in ${file}: ${msg}`);
  }
}

export abstract class TemplateParser {
  abstract parse(templateString: string, fileName: string): TemplateParseResult;
}
