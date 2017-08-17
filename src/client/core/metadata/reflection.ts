import { Type } from '../type';

const REFLECTION_PROP = '__reflection__';

export class Reflection {
  constructor(public readonly annotations: any[] = []) {}
}

export class Reflector {
  annotations(typeOrFunc: Type<any>): any[] {
    return this.resolve(typeOrFunc).annotations;
  }

  private resolve(typeOrFunc: Type<any>): Reflection {
    let reflection = typeOrFunc[REFLECTION_PROP];
    if (!reflection) {
      reflection = new Reflection();
      this.update(typeOrFunc, reflection);
    }
    return reflection;
  }

  private update(typeOrFunc: Type<any>, reflection: Reflection) {
    typeOrFunc[REFLECTION_PROP] = reflection;
  }
}

export const reflector = new Reflector();
