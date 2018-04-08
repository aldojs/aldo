
import * as http from 'http'
import { format } from 'util'
import * as assert from 'assert'
import compose from 'aldo-compose'
import ContextFactory from './context'
import * as createDebugger from 'debug'
import { Handler, Context } from './types'

const debug = createDebugger('aldo:application')

/**
 * 
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
      assert(typeof fn === 'function', `Function expected but got ${typeof fn}.`)

      debug(`use handler: ${fn.name || '<anonymous>'}`)
      this._handlers.push(fn as Handler)
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
      assert(typeof fn === 'function', `Function expected but got ${typeof fn}.`)

      debug(`use error handler: ${fn.name || '<anonymous>'}`)
      this._errorHandlers.push(fn)
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
    assert(typeof fn === 'function', `Function expected but got ${typeof fn}.`)
    debug(`set a private context attribute: ${prop}`)
    this._context.bind(prop, fn)
    return this
  }

  /**
   * Extend the app context by adding shared properties
   * 
   * @param prop
   * @param value
   */
  public set (prop: string, value: any): this {
    debug(`set a shared context attribute: ${prop}`)
    this._context.set(prop, value)
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
 * Handle the error response
 * 
 * @param error
 * @param ctx
 * @private
 */
function _report (error: any, { res }: Context) {
  console.error(error)
  res.statusCode = error.status || 500
  res.end(error.expose ? error.message : 'Internal Server Error')
}
