import { ListWrapper } from '../../util/collection';
import { isWhitespace, $PERIOD, $SEMICOLON } from '../chars';
import { AST, EmptyExpr, PropertyRead, MethodCall, ParseSpan } from './ast';
import { ExpressionParser } from './parser';

const word = '[A-Za-z0-9_\\$&\\*]+';
const regex = new RegExp( `^` +
                          `(` +
                            `${word}` +         // obj
                            `(?:\\.${word})*` + // .onClick
                          `)` +
                          `(` +
                            `\\(` +             // (
                            `(` +
                              `${word}` +       // arg1
                              `(?:,${word})*` + // , arg2
                            `)?` +
                            `\\)` +             // )
                          `)?` +
                          `$`
                        );

// Group 1 = "onClick" or "prop" or "prop1.prop2"
const KW_NAME_IDX = 1;
// Group 2 = "($event)"
const KW_FN_CALL_IDX = 2;
// Group 2 = "$event"
const KW_FN_ARGS_IDX = 3;

export class SimpleExpressionParser {
  parseBinding() {

  }

  parseEvent(expression: string): AST {
    const ast = this._parse(expression);
    if (ast instanceof EmptyExpr) {
      throw new Error(`No empty expressions are allowed on events!`);
    }
    if (!(ast instanceof MethodCall)) {
      throw new Error(`Invalid expression '${expression}'! ` +
        `Expressions on events can only be method calls, like 'onClick($event)'.`);
    }
    return ast;
  }

  private _parse(expression: string) {
    const value = removeWhitespaces(expression);

    if (!value.length) {
      return new EmptyExpr(this._createSpan(-1, -1));
    }

    const parts = value.match(regex);
    if (!parts) {
      throw new Error(`Unsupported Expression '${expression}! ` +
        `Only method calls and properties are allowed'`);
    }

    const isMethodCall = !!parts[KW_FN_CALL_IDX];
    const props = parts[KW_NAME_IDX].split(String.fromCharCode($PERIOD));
    const chain = isMethodCall ? props.slice(0, props.length - 1) : props;
    let receiver: AST = new EmptyExpr(this._createSpan(-1, -1));
    if (chain.length) {
      receiver = this._chainPropRead(chain, 0);
    }

    // if expression is just a property read, we are finished
    if (!isMethodCall) {
      return receiver;
    }

    // in this case the expression is a method call
    const fnName = props[props.length - 1];
    const argsOffset = props.length;
    let index = -1;
    const args = (parts[KW_FN_ARGS_IDX] || '')
      .split(String.fromCharCode($SEMICOLON))
      .map(arg => new PropertyRead(this._createSpan(argsOffset + ++index, arg.length),
          new EmptyExpr(this._createSpan(-1, -1)), arg));
    return new MethodCall(this._createSpan(0, expression.length), receiver, fnName, args);
  }

  private _chainPropRead(props: string[], offset: number, receiver?: AST): AST {
    if (!receiver) {
      receiver = new EmptyExpr(this._createSpan(-1, -1));
    }
    let index = -1;
    props.forEach((prop, idx) => {
      receiver = new PropertyRead(this._createSpan(++index, prop.length), receiver, prop);
      index += prop.length;
    });
    return receiver;
  }

  private _createSpan(start: number, length: number) {
    const end = length > 0 ? start + length - 1 : start;
    return new ParseSpan(start, end);
  }
}

function removeWhitespaces(value: string): string {
  let result = '';
  ListWrapper.forEach(value, char => {
    if (!isWhitespace(char.charCodeAt(0))) {
      result += char;
    }
  });
  return result;
}
