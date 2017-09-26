import {Type} from '../type';
import {NodeDef, NodeFlags} from './types';

export function selectableDef(nodeDef: NodeDef, name: string, attrs: [string, string][], classNames: string[],
  componentType: Type<any>): NodeDef {
  nodeDef.selectable = {
    name,
    attrs,
    classNames,
    componentType
  };
  nodeDef.flags |= NodeFlags.CatSelectable;
  return nodeDef;
}
