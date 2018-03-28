
import { format } from 'util'
import * as RadixTree from 'find-my-way'
import { Handler, Context } from './types'
import { setImmediate as defer } from 'timers'

export default class {
  private _finalHandler: Handler
  private _tree = new RadixTree()
  private _errorHandlers: Handler[] = []

  /**
   * 
   * @param fn
   */
  public constructor (fn: Handler = () => {}) {
    // TODO ensure the argument is a function
    this._finalHandler = fn
  }

  /**
   * Register a route handlers
   * 
   * @param method
   * @param path
   * @param fns
   */
  public register (method: string, path: string, fns: Handler[]): void {
    // TODO ensure the handlers are functions
    this._tree.on(method, path, (ctx: Context) => this._invoke(ctx, fns))
  }

  /**
   * Search and invoke the matched context handler
   * 
   * @param ctx
   */
  public dispatch (ctx: Context): void {
    var { method, url } = ctx.request
    var found = this._tree.find(method, url)

    if (!found) {
      ctx.error = _notFoundError(`Route not found for ${method} ${url}`)

      return this._invoke(ctx, this._errorHandlers)
    }

    // add url params to the context
    ctx.params = found.params || {}

    // invoke the route handler
    found.handler(ctx)
  }

  /**
   * Add an error handler
   * 
   * @param fn
   */
  public onError (fn: Handler): void {
    // TODO ensure the argument is a function
    this._errorHandlers.push(fn)
  }

  /**
   * Set the final handler
   * 
   * @param fn
   */
  public onFinished (fn: Handler): void {
    // TODO ensure the argument is a function
    this._finalHandler = fn
  }

  /**
   * Invoke the handlers one by one
   * 
   * @param ctx
   * @param fns
   */
  private _invoke (ctx: Context, fns: Handler[]): void {
    var i = 0

    var next = (err?: any): void => {
      if (err != null) {
        // ensure `err` is an instance of `Error`
        if (!(err instanceof Error)) {
          err = new Error(format('non-error thrown: %j', err))
        }

        if (ctx.error == null) {
          fns = this._errorHandlers
          i = 0 // rewind
        }

        ctx.error = err
      }

      var fn = fns[i++]

      if (!fn) defer(this._finalHandler, ctx)
      else defer(_tryHandler, fn, ctx, next)
    }

    next()
  }
}

/**
 * Try the current handler then call the next one
 * 
 * @param fn
 * @param ctx
 * @param done
 * @private
 */
async function _tryHandler (fn: Handler, ctx: Context, done: (err?: any) => void) {
  try {
    await fn(ctx)
    done()
  }
  catch (error) {
    done(error)
  }
}

/**
 * Create a 404 error instance
 * 
 * @param message
 * @private
 */
function _notFoundError (message: string): Error {
  var error: any = new Error(message)

  error.statusMessage = 'Not Found'
  error.statusCode = 404
  error.expose = true

  return error
}
