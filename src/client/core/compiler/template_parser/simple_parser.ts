import { ListWrapper } from '../../util/collection';
import { TemplateParser, TemplateParseError, TemplateParseResult } from './parser';
import { tokenize, TokenType, Token } from './simple_lexer';
import { getSimpleHtmlTagDefinition } from './html_tags';

enum VmType {
  Void,
  Element,
  Text,
  Comment,
  Attribute,
  EOF
}

const EOF = new Token(TokenType.EOF, []);

type TypeElementNode = [VmType.Element, string, TypeAttributeNode[], any[], boolean];
type TypeTextNode = [VmType.Text, string];
type TypeCommentNode = [VmType.Comment, string];
type TypeAttributeNode = [VmType.Attribute, string, string];
type TypeEOFNode = [VmType.EOF];
type TypeNode = TypeElementNode | TypeTextNode | TypeCommentNode | TypeAttributeNode | TypeEOFNode;

export class SimpleTemplateParser extends TemplateParser {
  parse(templateString: string, fileName: string): TemplateParseResult {
    return new Parser_(templateString, fileName).parse();
  }
}

export class Parser_ {

  private _tokens: Token[];
  private _index = -1;
  private _length = 0;
  private _peek: Token;

  private _openNodeIndex: -1;
  private _openNodeType: VmType = VmType.Void;

  private _nodes: TypeNode[] = [];
  private _errors: TemplateParseError[] = [];

  constructor(private _input: string, private _file: string) { }

  parse(): TemplateParseResult {
    const tokenResult = tokenize(this._input, getSimpleHtmlTagDefinition);
    if (tokenResult.errors.length) {
      return new TemplateParseResult(this._file, this._input, [],
        tokenResult.errors.map(err => new TemplateParseError(err.message || err as any, this._file)));
    }
    if (!tokenResult.tokens || !tokenResult.tokens.length) {
      return new TemplateParseResult(this._file, this._input, [], []);
    }
    const tokens = this._tokens = tokenResult.tokens;
    this._nodes = [];
    this._index = -1;
    this._length = tokens.length;

    this._advance();
    try {
      const nodes: any[] = this._visitTokenUntilFn(token => token.type === TokenType.EOF);
      return new TemplateParseResult(this._file, this._input, nodes, []);
    } catch (e) {
      if (e instanceof TemplateParseError) {
        return new TemplateParseResult(this._file, this._input, [], this._errors);
      } else {
        throw e;
      }
    }
  }

  private _advance() {
    if (this._index >= this._length) {
      throw this._reportError(`Out of range`);
    }
    this._index++;
    this._peek = this._index >= this._length ? EOF : this._tokens[this._index];
  }

  private _attemptToken(tokenType: TokenType): boolean {
    if (this._peek.type === tokenType) {
      return true;
    }
    return false;
  }

  private _visitTokenUntilFn(predicate: (token: Token) => boolean): TypeNode[] {
    const nodes: TypeNode[] = [];
    while (!predicate(this._peek)) {
      if (this._attemptToken(TokenType.TAG_OPEN_START)) {
        nodes.push(this._visitTag());
      } else if (this._attemptToken(TokenType.COMMENT_START)) {
        nodes.push(this._visitComment());
      } else if (this._attemptToken(TokenType.TEXT) || this._attemptToken(TokenType.RAW_TEXT)) {
        nodes.push(this._visitText());
      } else if (this._attemptToken(TokenType.ATTR_NAME)) {
        nodes.push(this._visitAttribute());
      } else {
        throw this._reportError(`${TokenType[this._peek.type]} is not allowed in this position!`);
      }
    }
    return nodes;
  }

  private _visitTag(): TypeElementNode {

    const tagName = this._findInParts(this._peek);
    const def = getSimpleHtmlTagDefinition(tagName);

    this._advance();
    const attrs = this._visitTokenUntilFn(token => token.type !== TokenType.ATTR_NAME) as TypeAttributeNode[];
    const isTagOpenEnd = this._attemptToken(TokenType.TAG_OPEN_END);
    const isTagOpenEndVOid = this._attemptToken(TokenType.TAG_OPEN_END_VOID);
    this._advance();

    if ((isTagOpenEnd && def.isVoid)  || isTagOpenEndVOid) {
      return [VmType.Element, tagName, attrs, [], true];
    } else if (isTagOpenEnd) {
      const children = this._visitTokenUntilFn(token => token.type === TokenType.TAG_CLOSE);
      this._advance();
      return [VmType.Element, tagName, attrs, children, false];
    } else {
      throw this._reportError(`Could not close Tag ${tagName}.`);
    }
  }

  private _visitText(): TypeTextNode {
    let text = '';
    ListWrapper.forEach(this._peek.parts, part => {
      if (!isEmptyText(part)) text += part;
    });
    this._advance();
    return [VmType.Text, text];
  }

  private _visitComment(): TypeCommentNode {
    let text = '';
    this._advance();
    while (true) {
      if (this._attemptToken(TokenType.RAW_TEXT)) {
        ListWrapper.forEach(this._peek.parts, part => {
          text += part;
        });
        this._advance();
      } else {
        break;
      }
    }
    if (this._attemptToken(TokenType.COMMENT_END)) {
      this._advance();
      return [VmType.Comment, text];
    } else {
      throw this._reportError(`Comments can only contain text`);
    }
  }

  private _visitAttribute(): TypeAttributeNode {
    const name = this._findInParts(this._peek);
    let value = '';
    this._advance();
    if (this._attemptToken(TokenType.ATTR_VALUE)) {
      value = this._findInParts(this._peek);
      this._advance();
    }
    return [VmType.Attribute, name, value];
  }

  private _findInParts(token: Token) {
    return ListWrapper.findFirst(token.parts, part => part && !!part.trim().length);
  }

  private _reportError(msg: string) {
    const err = new TemplateParseError(msg, this._file);
    this._errors.push(err);
    return err;
  }
}


function isEmptyText(text: string) {
  return !text.replace(/[\n\r]/g, '').trim().length
}
