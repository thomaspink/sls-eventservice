import { Provider } from '../../di/provider';
import { SimpleTemplateParser } from './simple_parser';
// import { TemplateNodeDef } from '../../view/types';

export class TemplateParseResult {
  constructor(public fileName: string, templateString: string,
    public nodes: any/*TemplateNodeDef*/[], public errors: TemplateParseError[]) { }
}

export class TemplateParseError extends Error {
  constructor(msg: string, file: string) {
    super(`Template Parse Error in ${file}: ${msg}`);
  }
}

export abstract class TemplateParser {
  abstract parse(templateString: string, fileName: string): TemplateParseResult;
}
