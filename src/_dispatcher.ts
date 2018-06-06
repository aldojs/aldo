
export interface IMiddleware<T> {
  (input: T, next: () => any): any
}

/**
 * Middleware dispatcher class
 */
export class Dispatcher<T> {
  /**
   * The middleware stack
   * 
   * @private
   */
  private _middlewares: IMiddleware<T>[]

  /**
   * Initialize a new dispatcher instance
   * 
   * @param stack the middleware stack
   */
  public constructor (stack: IMiddleware<T>[] = []) {
    this._middlewares = stack
  }

  /**
   * Use a middleware
   * 
   * @param fn The middleware function
   * @public
   */
  public use (fn: IMiddleware<T>): this {
    this._middlewares.push(fn)
    return this
  }

  /**
   * Dispatch the given input to the middlewares
   * 
   * @param input
   * @public
   */
  public dispatch (input: T): any {
    return this._invoke(0, input)
  }

  /**
   * Invoke the current middleware
   * 
   * @param idx The current middleware index
   * @param arg The input to dispatch
   * @private
   */
  private _invoke (idx: number, arg: T): any {
    let fn = this._middlewares[idx]

    if (fn) return fn(arg, () => this._invoke(idx + 1, arg))
  }
}
