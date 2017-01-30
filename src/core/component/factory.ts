import { ClassType } from '../facade';
import { ComponentRef } from './reference';

export class ComponentFactory<C> {

  private _componentType: ClassType<C>;

  constructor(componentType: ClassType<C>) {
    this._componentType = componentType;
  }

  get componentType(): ClassType<C> { return this._componentType; }

  create(nativeElement: Element): ComponentRef<C> {
    const type = this._componentType;
    let ref = new ComponentRef(nativeElement, type);
    return ref;
  }
}



