
import * as http from 'http'
import { format } from 'util'
import { compose } from './handlers'
import ContextFactory from './context'
import * as createDebugger from 'debug'
import { Handler, Context } from './types'

const debug = createDebugger('aldo:application')

/**
 * A global facade to manage routes, error handlers, dispatching, etc...
 */
export default class Application {
  private _handlers: Handler[] = []
  private _errorHandlers: Handler[] = []
  private _context = new ContextFactory()

  /**
   * Use request handlers
   * 
   * @param fns
   */
  public use (...fns: Handler[]): this {
    for (let fn of fns) {
      this._handlers.push(_ensureFunction(fn))
      debug(`use handler: ${fn.name || '<anonymous>'}`)
    }

    return this
  }

  /**
   * Use error handlers
   * 
   * @param fns
   */
  public catch (...fns: Handler[]): this {
    for (let fn of fns) {
      this._errorHandlers.push(_ensureFunction(fn))
      debug(`use error handler: ${fn.name || '<anonymous>'}`)
    }

    return this
  }

  /**
   * Return a request callback
   */
  public callback (): (req: http.IncomingMessage, res: http.ServerResponse) => void {
    var handleError = compose(this._errorHandlers.length > 0 ? this._errorHandlers : [_report])
    var dispatch = compose(this._handlers)

    return (req, res) => {
      var ctx = this._context.from(req, res)

      debug(`dispatching: ${req.method} ${req.url}`)

      dispatch(ctx).catch((err) => {
        // ensure `err` is an instance of `Error`
        if (!(err instanceof Error)) {
          err = new TypeError(format('non-error thrown: %j', err))
        }

        // set the error
        ctx.error = err

        return handleError(ctx)
      })
    }
  }

  /**
   * Extend the app context by adding per instance property
   * 
   * @param prop
   * @param fn
   */
  public bind (prop: string, fn: (ctx: Context) => any): this {
    this._context.bind(prop, _ensureFunction(fn))
    debug(`set a private context attribute: ${prop}`)
    return this
  }

  /**
   * Extend the app context by adding shared properties
   * 
   * @param prop
   * @param value
   */
  public set (prop: string, value: any): this {
    this._context.set(prop, value)
    debug(`set a shared context attribute: ${prop}`)
    return this
  }

  /**
   * Get a value from the app context
   * 
   * @param prop
   */
  public get (prop: string): any {
    return this._context.get(prop)
  }

  /**
   * Check if the prop is defined in the app context
   * 
   * @param prop
   */
  public has (prop: string): boolean {
    return this._context.has(prop)
  }

  /**
   * Shorthand for:
   * 
   *     http.createServer(app.callback()).listen(...args)
   */
  public listen (): http.Server {
    return http.createServer(this.callback() as any).listen(...arguments)
  }
}

/**
 * Ensure the given argument is a function
 * 
 * @param arg
 * @private
 */
function _ensureFunction (arg: any): Handler {
  if (typeof arg === 'function') return arg

  throw new TypeError(`Function expected but got ${typeof arg}.`)
}

/**
 * Send the error response
 * 
 * @param ctx
 */
function _report ({ error, res }: Context) {
  res.statusCode = error.status || 500
  res.end(error.message)

  console.error(error)
}
