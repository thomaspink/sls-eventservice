import { ListWrapper } from '../../util/collection';
import { isWhitespace, $PERIOD, $SEMICOLON } from '../chars';
import {
  AST, ASTWithSource, EmptyExpr, ImplicitReceiver, PropertyRead, MethodCall,
  ParseSpan, ParserError
} from './ast';
import { ExpressionParser } from './api';

// Regex for parsing the expression. As it can only be a method call or
// property access we can use a regex.
const word = '[A-Za-z0-9_\\$&\\*]+';
const regex = new RegExp(`^` +
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

/**
 * This simple parser should be used at runtime as the expression parser.
 * It is way simpler and not that heavy.
 * The downside is, that only method calls and property access is available
 * in expressions.
 *
 * Examples:
 * `myProperty`
 * `obj.prop`
 * `onClick()`
 * `obj.onStart($event)`
 */
export class SimpleExpressionParser extends ExpressionParser {

  constructor() { super(); }

  parseBinding(input: string, location: string): ASTWithSource  {
    // TODO
    return new ASTWithSource(new EmptyExpr(this._createSpan(-1, -1)), input, location, []);
  }

  parseAction(input: string, location: string): ASTWithSource  {
    const ast = this._parse(input);
    if (ast instanceof EmptyExpr) {
      throw new Error(`No empty expressions are allowed on events!`);
    }
    if (!(ast instanceof MethodCall)) {
      throw new Error(`Invalid expression '${input}'! ` +
        `Expressions on events can only be method calls, like 'onClick($event)'.`);
    }
    return new ASTWithSource(ast, input, location, []);
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

    // If second group is set we know its a method call
    const isMethodCall = !!parts[KW_FN_CALL_IDX];

    // Get props of chain by splitting on every period
    const props = parts[KW_NAME_IDX].split(String.fromCharCode($PERIOD));

    // If it is a method call, remove last prop (the method name) from the
    // property chain as it will be handled extra down below.
    const chain = isMethodCall ? props.slice(0, props.length - 1) : props;

    // Build the property read chain
    let receiver: AST = new ImplicitReceiver(this._createSpan(0, 0));
    if (chain.length) {
      receiver = this._chainPropRead(chain, 0, receiver);
    }

    // If expression is just a property read, we are finished
    if (!isMethodCall) {
      return receiver;
    }

    // In this case the expression is a method call
    // The last prop is the function name (we skipped it above)
    const fnName = props[props.length - 1];

    // Construct args AST by splitting the third part on every semicolon
    const argsOffset = props.length;
    let index = -1;
    const args = (parts[KW_FN_ARGS_IDX] || '')
      .split(String.fromCharCode($SEMICOLON))
      .map(arg => new PropertyRead(this._createSpan(argsOffset + ++index, arg.length),
        new ImplicitReceiver(this._createSpan(++index, index)), arg));
    return new MethodCall(this._createSpan(0, expression.length), receiver, fnName, args);
  }

  private _chainPropRead(props: string[], offset: number, receiver?: AST): AST {
    if (!receiver) {
      receiver = new ImplicitReceiver(this._createSpan(offset, offset));
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
