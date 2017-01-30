import { ComponentMetadata } from './component/metadata';
import { ClassType } from './facade';
import { ClassReflection } from './reflection';
import { BaseError } from './error';
import { stringify } from './utils';

export function Component(metadata: { selector: string }): ClassDecorator {
  return (componentType: ClassType<any> ) => {
    const reflection = ClassReflection.peek(componentType);
    if(reflection.annotations.has(ComponentMetadata)) {
      throw new ComponentAlreadyAnnotatedError(componentType);
    }
    reflection.annotations.set(ComponentMetadata, new ComponentMetadata(metadata));
  };
}

export class ComponentAlreadyAnnotatedError extends BaseError {
  constructor(classType: ClassType<any>) {
    super(`Component class "${stringify(classType)}" has already been annotated with metadata.`);
  }
}

