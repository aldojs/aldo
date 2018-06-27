
import { Context } from './container'

export type Middleware = (input: Context, next: () => any) => any

export interface IDispatcher {
  dispatch (ctx: Context): any
  use (fn: Middleware): void
}

/**
 * Middleware dispatcher class
 */
export class Dispatcher implements IDispatcher {
  /**
   * The middleware stack
   * 
   * @private
   */
  private _middlewares: Middleware[]

  /**
   * Initialize a new dispatcher instance
   * 
   * @param stack The middleware stack
   * @constructor
   * @public
   */
  public constructor (stack = []) {
    this._middlewares = stack
  }

  /**
   * Use a middleware
   * 
   * @param fn The middleware function
   * @public
   */
  public use (fn: Middleware): this {
    this._middlewares.push(fn)
    return this
  }

  /**
   * Dispatch the given input to the middlewares
   * 
   * @param ctx
   * @public
   */
  public dispatch (ctx: Context): any {
    return this._invoke(0, ctx)
  }

  /**
   * Invoke the current middleware
   * 
   * @param idx The current middleware index
   * @param ctx The context to dispatch
   * @private
   */
  private _invoke (idx: number, ctx: Context): any {
    let fn = this._middlewares[idx]

    if (fn) return fn(ctx, () => this._invoke(idx + 1, ctx))
  }
}
