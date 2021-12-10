/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
export default class Completer<T> {
  isCompleted = false;
  value?: T;

  private _promise: Promise<T>;

  private _resolve?: (value: T) => void;
  private _reject?: (reason?: any) => void;

  constructor() {
    this._promise = new Promise<T>((resolve, reject) => {
      this._resolve = resolve;
      this._reject = reject;
    });
  }

  get promise(): Promise<T> {
    return this._promise;
  }

  complete(value: T): void {
    this.isCompleted = true;
    this.value = value;
    this._resolve!(value);
  }

  reject(reason?: any): void {
    this.isCompleted = true;
    this._reject!(reason);
  }
}
