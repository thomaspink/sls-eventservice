import { TagDefinition, TagContentType } from './tags';
import { $EOF, $LT, $BANG, $LBRACKET, $MINUS, $SLASH, $GT, $COLON, $a, $z, $A, $Z, $0, $9, $SQ, $DQ, $EQ, isWhitespace, isAsciiLetter } from '../chars';

export enum TokenType {
  TAG_OPEN_START,
  TAG_OPEN_END,
  TAG_OPEN_END_VOID,
  TAG_CLOSE,
  TEXT,
  RAW_TEXT,
  COMMENT_START,
  COMMENT_END,
  ATTR_NAME,
  ATTR_VALUE,
  EOF
}

export class Token {
  constructor(public type: TokenType, public parts: string[]) { }
}

export class TokenizeResult {
  constructor(public tokens: Token[], public errors: Error[]) { }
}

class _ControlFlowError {
  constructor(public error: Error) { }
}

function _unexpectedCharacterErrorMsg(charCode: number): string {
  const char = charCode === $EOF ? 'EOF' : String.fromCharCode(charCode);
  return `Unexpected character "${char}"`;
}

const _CR_OR_CRLF_REGEXP = /\r\n?/g;

export function tokenize(input: string, getTagDefinition: (tagName: string) => TagDefinition): TokenizeResult {
  return new _Tokenizer(input, getTagDefinition).tokenize();
}

class _Tokenizer {
  private _input: string;
  private _length: number;
  // Note: this is always lowercase!
  private _peek: number = -1;
  private _nextPeek: number = -1;
  private _index: number = -1;
  private _currentTokenType: TokenType;

  tokens: Token[] = [];
  errors: Error[] = [];

  constructor(input: string, private _getTagDefinition: (tagName: string) => TagDefinition) {
    this._input = input;
    this._length = input.length;
    this._advance();
  }

  tokenize() {
    while (this._peek !== $EOF) {
      try {
        if (this._attemptCharCode($LT)) {
          if (this._attemptCharCode($BANG)) {
            if (this._attemptCharCode($LBRACKET)) {
              throw new Error(`CDATA is not yet supported in templates!`);
            } else if (this._attemptCharCode($MINUS)) {
              this._consumeComment();
            } else {
              throw new Error(`Doctypes are not yet supported in templates!`);
            }
          } else if (this._attemptCharCode($SLASH)) {
            this._consumeTagClose();
          } else {
            this._consumeTagOpen();
          }
        } else {
          this._consumeText();
        }
      } catch (e) {
        if (e instanceof _ControlFlowError) {
          this.errors.push(e.error);
        } else {
          throw e;
        }
      }
    }
    this._beginToken(TokenType.EOF);
    this._endToken([]);
    return new TokenizeResult(mergeTextTokens(this.tokens), this.errors);
  }

  private _advance() {
    if (this._index >= this._length) {
      throw new Error(_unexpectedCharacterErrorMsg($EOF));
    }
    this._index++;
    this._peek = this._index >= this._length ? $EOF : this._input.charCodeAt(this._index);
    this._nextPeek =
      this._index + 1 >= this._length ? $EOF : this._input.charCodeAt(this._index + 1);
  }

  private _attemptCharCode(charCode: number): boolean {
    if (this._peek === charCode) {
      this._advance();
      return true;
    }
    return false;
  }

  private _requireCharCode(charCode: number) {
    if (!this._attemptCharCode(charCode)) {
      throw new Error(_unexpectedCharacterErrorMsg(this._peek));
    }
  }

  private _attemptCharCodeCaseInsensitive(charCode: number): boolean {
    if (compareCharCodeCaseInsensitive(this._peek, charCode)) {
      this._advance();
      return true;
    }
    return false;
  }

  private _attemptStr(chars: string): boolean {
    const len = chars.length;
    if (this._index + len > this._length) {
      return false;
    }
    for (let i = 0; i < len; i++) {
      if (!this._attemptCharCode(chars.charCodeAt(i))) {
        return false;
      }
    }
    return true;
  }

  private _attemptStrCaseInsensitive(chars: string): boolean {
    for (let i = 0; i < chars.length; i++) {
      if (!this._attemptCharCodeCaseInsensitive(chars.charCodeAt(i))) {
        return false;
      }
    }
    return true;
  }

  private _attemptCharCodeUntilFn(predicate: (code: number) => boolean) {
    while (!predicate(this._peek)) {
      this._advance();
    }
  }

  private _requireCharCodeUntilFn(predicate: (code: number) => boolean, len: number) {
    const offset = this._index;
    this._attemptCharCodeUntilFn(predicate);
    if (this._index - offset < len) {
      throw this._createError(_unexpectedCharacterErrorMsg(this._peek));
    }
  }

  private _readChar(): string {
    const index = this._index;
    this._advance();
    return this._input[index];
  }

  private _beginToken(type: TokenType) {
    this._currentTokenType = type;
  }

  private _endToken(parts: string[]): Token {
    const token =
      new Token(this._currentTokenType, parts);
    this.tokens.push(token);
    this._currentTokenType = null!;
    return token;
  }

  private _createError(msg: string): _ControlFlowError {
    const error = new Error(msg);
    this._currentTokenType = null!;
    return new _ControlFlowError(error);
  }

  private _consumeTagOpen() {
    let tagName: string;
    let lowercaseTagName: string;
    try {
      if (!isAsciiLetter(this._peek)) {
        throw this._createError(_unexpectedCharacterErrorMsg(this._peek));
      }
      const nameStart = this._index;
      this._consumeTagOpenStart();
      tagName = this._input.substring(nameStart, this._index);
      lowercaseTagName = tagName.toLowerCase();
      this._attemptCharCodeUntilFn(isNotWhitespace);
      while (this._peek !== $SLASH && this._peek !== $GT) {
        this._consumeAttributeName();
        this._attemptCharCodeUntilFn(isNotWhitespace);
        if (this._attemptCharCode($EQ)) {
          this._attemptCharCodeUntilFn(isNotWhitespace);
          this._consumeAttributeValue();
        }
        this._attemptCharCodeUntilFn(isNotWhitespace);
      }
      this._consumeTagOpenEnd();
    } catch (e) {
      if (e instanceof _ControlFlowError) {
        // Back to back text tokens are merged at the end
        this._beginToken(TokenType.TEXT);
        this._endToken(['<']);
        return;
      }

      throw e;
    }
    const contentTokenType = this._getTagDefinition(tagName).contentType;
    if (contentTokenType === TagContentType.RAW_TEXT || contentTokenType === TagContentType.ESCAPABLE_RAW_TEXT) {
      this._consumeRawTextWithTagClose(lowercaseTagName);
    }
  }

  private _consumeTagClose() {
    this._beginToken(TokenType.TAG_CLOSE);
    this._attemptCharCodeUntilFn(isNotWhitespace);
    const prefixAndName = this._consumePrefixAndName();
    this._attemptCharCodeUntilFn(isNotWhitespace);
    this._requireCharCode($GT);
    this._endToken(prefixAndName);
  }

  private _consumeTagOpenStart() {
    this._beginToken(TokenType.TAG_OPEN_START);
    const parts = this._consumePrefixAndName();
    this._endToken(parts);
  }

  private _consumeTagOpenEnd() {
    const tokenType =
      this._attemptCharCode($SLASH) ? TokenType.TAG_OPEN_END_VOID : TokenType.TAG_OPEN_END;
    this._beginToken(tokenType);
    this._requireCharCode($GT);
    this._endToken([]);
  }

  private _consumeAttributeName() {
    this._beginToken(TokenType.ATTR_NAME);
    const prefixAndName = this._consumePrefixAndName();
    this._endToken(prefixAndName);
  }

  private _consumeAttributeValue() {
    this._beginToken(TokenType.ATTR_VALUE);
    let value: string;
    if (this._peek === $SQ || this._peek === $DQ) {
      const quoteChar = this._peek;
      this._advance();
      const parts: string[] = [];
      while (this._peek !== quoteChar) {
        parts.push(this._readChar());
      }
      value = parts.join('');
      this._advance();
    } else {
      const valueStart = this._index;
      this._requireCharCodeUntilFn(isNameEnd, 1);
      value = this._input.substring(valueStart, this._index);
    }
    this._endToken([this._processCarriageReturns(value)]);
  }

  private _consumeComment() {
    this._beginToken(TokenType.COMMENT_START);
    this._requireCharCode($MINUS);
    this._endToken([]);
    const textToken = this._consumeRawText($MINUS, () => this._attemptStr('->'));
    this._beginToken(TokenType.COMMENT_END);
    this._endToken([]);
  }

  private _consumePrefixAndName(): string[] {
    const nameOrPrefixStart = this._index;
    let prefix: string = null!;
    while (this._peek !== $COLON && !isPrefixEnd(this._peek)) {
      this._advance();
    }
    let nameStart: number;
    if (this._peek === $COLON) {
      this._advance();
      prefix = this._input.substring(nameOrPrefixStart, this._index - 1);
      nameStart = this._index;
    } else {
      nameStart = nameOrPrefixStart;
    }
    this._requireCharCodeUntilFn(isNameEnd, this._index === nameStart ? 1 : 0);
    const name = this._input.substring(nameStart, this._index);
    return [prefix, name];
  }

  private _consumeText() {
    this._beginToken(TokenType.TEXT);
    const parts: string[] = [];
    do {
      parts.push(this._readChar());
    } while (!this._isTextEnd());

    this._endToken([this._processCarriageReturns(parts.join(''))]);
  }

  private _consumeRawText(firstCharOfEnd: number, attemptEndRest: () => boolean): Token {
    this._beginToken(TokenType.RAW_TEXT);
    const parts: string[] = [];
    while (true) {
      const offset = this._index;
      if (this._attemptCharCode(firstCharOfEnd) && attemptEndRest()) {
        break;
      }
      if (this._index > offset) {
        // add the characters consumed by the previous if statement to the output
        parts.push(this._input.substring(offset, this._index));
      }
      while (this._peek !== firstCharOfEnd) {
        parts.push(this._readChar());
      }
    }
    return this._endToken([this._processCarriageReturns(parts.join(''))]);
  }

  private _consumeRawTextWithTagClose(lowercaseTagName: string) {
    const textToken = this._consumeRawText($LT, () => {
      if (!this._attemptCharCode($SLASH)) return false;
      this._attemptCharCodeUntilFn(isNotWhitespace);
      if (!this._attemptStrCaseInsensitive(lowercaseTagName)) return false;
      this._attemptCharCodeUntilFn(isNotWhitespace);
      return this._attemptCharCode($GT);
    });
    this._beginToken(TokenType.TAG_CLOSE);
    this._endToken([null!, lowercaseTagName]);
  }

  private _isTextEnd(): boolean {
    if (this._peek === $LT || this._peek === $EOF) {
      return true;
    }
    return false;
  }

  private _processCarriageReturns(content: string): string {
    // http://www.w3.org/TR/html5/syntax.html#preprocessing-the-input-stream
    // In order to keep the original position in the source, we can not
    // pre-process it.
    // Instead CRs are processed right before instantiating the tokens.
    return content.replace(_CR_OR_CRLF_REGEXP, '\n');
  }
}

function mergeTextTokens(srcTokens: Token[]): Token[] {
  const dstTokens: Token[] = [];
  let lastDstToken: Token | undefined = undefined;
  for (let i = 0; i < srcTokens.length; i++) {
    const token = srcTokens[i];
    if (lastDstToken && lastDstToken.type == TokenType.TEXT && token.type == TokenType.TEXT) {
      lastDstToken.parts[0] += token.parts[0];
    } else {
      lastDstToken = token;
      dstTokens.push(lastDstToken);
    }
  }
  return dstTokens;
}

function isNotWhitespace(code: number): boolean {
  return !isWhitespace(code) || code === $EOF;
}

function isPrefixEnd(code: number): boolean {
  return (code < $a || $z < code) && (code < $A || $Z < code) &&
    (code < $0 || code > $9);
}

function isNameEnd(code: number): boolean {
  return isWhitespace(code) || code === $GT || code === $SLASH ||
    code === $SQ || code === $DQ || code === $EQ;
}

function compareCharCodeCaseInsensitive(code1: number, code2: number): boolean {
  return toUpperCaseCharCode(code1) == toUpperCaseCharCode(code2);
}

function toUpperCaseCharCode(code: number): number {
  return code >= $a && code <= $z ? code - $a + $A : code;
}
