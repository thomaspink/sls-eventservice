export class EventEmitter<T> {

  observers: EventObserver<T>[] = [];
  closed = false;
  isStopped = false;
  hasError = false;
  thrownError: any = null;

  emit(value?: T) {
    this.next(value);
  }

  next(value?: T) {
    if (this.closed) {
      throw new ObjectUnsubscribedError();
    }
    if (!this.isStopped) {
      const { observers } = this;
      const len = observers.length;
      const copy = observers.slice();
      for (let i = 0; i < len; i++) {
        copy[i].next(value);
      }
    }
  }

  error(err: any) {
    if (this.closed) {
      throw new ObjectUnsubscribedError();
    }
    this.hasError = true;
    this.thrownError = err;
    this.isStopped = true;
    const { observers } = this;
    const len = observers.length;
    const copy = observers.slice();
    for (let i = 0; i < len; i++) {
      copy[i].error(err);
    }
    this.observers.length = 0;
  }

  complete() {
    if (this.closed) {
      throw new ObjectUnsubscribedError();
    }
    this.isStopped = true;
    const { observers } = this;
    const len = observers.length;
    const copy = observers.slice();
    for (let i = 0; i < len; i++) {
      copy[i].complete();
    }
    this.observers.length = 0;
  }

  subscribe(next:(value: T) => void, error?: (error: any) => void, complete?: () => void): EventSubscription {
    if (this.closed) {
      throw new ObjectUnsubscribedError();
    } else if (this.hasError) {
      this.error(this.thrownError);
    } else if (this.isStopped) {
      this.complete();
      return EventSubscription .EMPTY;
    } else {
      const observer: EventObserver<T> = { closed: false, next, error, complete };
      this.observers.push(observer);
      return new EventSubscription(() => {
        observer.closed = true;
      });
    }
  }

  unsubscribe() {
    this.isStopped = true;
    this.closed = true;
    this.observers = null;
  }
}

export interface EventObserver<T> {
  closed?: boolean;
  next: (value: T) => void;
  error: (err: any) => void;
  complete: () => void;
}

export class EventSubscription {
  public static EMPTY: EventSubscription  = (function(empty: any){
    empty.closed = true;
    return empty;
  }(new EventSubscription ()));

  public closed: boolean = false;
  private _unsubscribe: () => void;

  constructor(unsubscribe?: () => void) {
    if (unsubscribe) {
      this._unsubscribe = unsubscribe;
    }
  }

  unsubscribe() {
    if (this.closed) {
      return;
    }
    if (this._unsubscribe) {
      try {
        this._unsubscribe();
      } catch (ex) {

      }
    }
  }
}

export class ObjectUnsubscribedError extends Error {
  constructor() {
    const err: any = super('object unsubscribed');
    (<any> this).name = err.name = 'ObjectUnsubscribedError';
    (<any> this).stack = err.stack;
    (<any> this).message = err.message;
  }
}
