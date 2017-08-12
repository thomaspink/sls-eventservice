import {Subject} from 'rxjs/Subject';

export class EventEmitter<T> extends Subject<T> {
  constructor() {
    super();
  }

  emit(value?: T) {
    super.next(value);
  }
}
