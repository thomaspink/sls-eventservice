/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

export enum TagContentType {
  RAW_TEXT,
  ESCAPABLE_RAW_TEXT,
  PARSABLE_DATA
}

export interface TagDefinition {
  closedByParent: boolean;
  requiredParents: {[key: string]: boolean};
  parentToAdd: string;
  implicitNamespacePrefix: string|null;
  contentType: TagContentType;
  isVoid: boolean;
  ignoreFirstLf: boolean;
  canSelfClose: boolean;

  requireExtraParent(currentParent: string): boolean;

  isClosedByChild(name: string): boolean;
}
