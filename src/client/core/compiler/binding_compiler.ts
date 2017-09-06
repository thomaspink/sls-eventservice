import { BindingDef, BindingFlags, ViewData } from '../view/types';
import { ExpressionParser } from './expression_parser/api';
import { EmptyExpr, ParserError, AST } from './expression_parser/ast';
import { ExpressionInterpreter } from './expression_parser/interpreter';
import { splitAtColon } from './util';

// tslint:disable-next-line:max-line-length
const BIND_NAME_REGEXP = /^(?:(?:(?:(bind-)|(let-)|(ref-|#)|(on-)|(bindon-))(.+))|\[\(([^\)]+)\)\]|\[([^\]]+)\]|\(([^\)]+)\))$/;

// Group 1 = "bind-"
const KW_BIND_IDX = 1;
// Group 2 = "let-"
const KW_LET_IDX = 2;
// Group 3 = "ref-/#"
const KW_REF_IDX = 3;
// Group 4 = "on-"
const KW_ON_IDX = 4;
// Group 5 = "bindon-"
const KW_BINDON_IDX = 5;
// Group 7 = the identifier after "bind-", "let-", "ref-/#", "on-", "bindon-" or "@"
const IDENT_KW_IDX = 6;
// Group 8 = identifier inside [()]
const IDENT_BANANA_BOX_IDX = 7;
// Group 9 = identifier inside []
const IDENT_PROPERTY_IDX = 8;
// Group 10 = identifier inside ()
const IDENT_EVENT_IDX = 9;

const CLASS_ATTR = 'class';

export class BindingCompiler {
  constructor(private _expressionParser: ExpressionParser) { }

  compile(declaration: string, expression: string, index: number, isHost: boolean,
    location: string): { def: BindingDef, ast: AST } {
    declaration = this._normalizeAttributeName(declaration);

    const bindParts = declaration.match(BIND_NAME_REGEXP);
    let hasBinding = false;

    if (bindParts !== null) {
      hasBinding = true;
      if (bindParts[KW_BIND_IDX] != null) {
        unsupported('Property binding', name, expression);
      } else if (bindParts[KW_LET_IDX]) {
        unsupported('Variable declaration', name, expression);
      } else if (bindParts[KW_REF_IDX]) {
        unsupported('Variable declaration', name, expression);
      } else if (bindParts[KW_ON_IDX]) {
        return this._parseEvent(bindParts[KW_ON_IDX], expression, index, isHost, location);
      } else if (bindParts[KW_BINDON_IDX]) {
        unsupported('Two way binding', name, expression);
      } else if (bindParts[IDENT_BANANA_BOX_IDX]) {
        unsupported('Two way binding', name, expression);
      } else if (bindParts[IDENT_PROPERTY_IDX]) {
        unsupported('Property binding', name, expression);
      } else if (bindParts[IDENT_EVENT_IDX]) {
        return this._parseEvent(bindParts[IDENT_EVENT_IDX], expression, index, isHost, location);
      }
    }
  }

  private _parseEvent(name: string, expression: string, index: number, isHost: boolean,
    location: string): { def: BindingDef, ast: AST } {
    const [target, eventName] = splitAtColon(name, [null!, name]);

    const ast = this._parseAction(expression, location);
    // console.log();
    // const handleEventFn = function($event: any) {
    //   return interpreter.visit(ast);
    // };
    // const def: BindingDef = {
    //   index,
    //   type: NodeTypes.Binding,
    //   flags: BindingFlags.TypeEvent,
    //   ns: target,
    //   name,
    //   suffix: null,
    //   isHost
    // };

    return { def: null, ast };
  }

  private _parseAction(value: string, location: string) {
    try {
      const ast = this._expressionParser.parseAction(value, location);
      if (!ast || ast.ast instanceof EmptyExpr) {
        throw new ParserError(`Empty expressions are not allowed`, value, 'HostListener', location);
      }
      return ast;
    } catch (e) {
      throw new ParserError(`${e}`, value, 'HostListener', location);
    }
  }

  private _normalizeAttributeName(attrName: string): string {
    return /^data-/i.test(attrName) ? attrName.substring(5) : attrName;
  }
}

function unsupported(type: string, name: string, expression: string) {
  throw new Error(`${type} is not yet supported: ${name}="${expression}"`);
}
