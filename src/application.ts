
import Request from './request'
import * as assert from 'assert'
import { setImmediate } from 'timers'
import * as compose from 'aldo-compose'
import * as createDebugger from 'debug'
import ContextBuilder, { Context } from './context'
import { createServer, IncomingMessage, ServerResponse, Server } from 'http'

const debug = createDebugger('aldo:application')

export type Middleware = compose.Middleware<Context>

export default class Application {
  /**
   * Application context
   */
  private _context = new ContextBuilder()

  /**
   * Application middlewares
   */
  private _middlewares: Middleware[] = []

  /**
   * Application options
   */
  private _options: object

  /**
   * Initialize a new application
   *
   * @param options
   */
  constructor (options: { proxy?: boolean } = {}) {
    this._options = options
  }

  /**
   * Use request middleware
   *
   * @param fn
   */
  use (fn: Middleware) {
    assert(typeof fn === 'function', `Expect a function but got: ${typeof fn}.`)
    debug(`use middleware: ${fn.name || '<anonymous>'}`)
    this._middlewares.push(fn)
    return this
  }

  /**
   * Return a request listener
   */
  callback (): (req: IncomingMessage, res: ServerResponse) => void {
    var dispatch = compose(this._middlewares)

    return (req, res) => {
      var ctx = this._context.create(new Request(req, this._options))

      debug(`dispatching: ${req.method} ${req.url}`)

      setImmediate(dispatch, ctx)
      // setImmediate(async () => {
      //   var out = await dispatch(ctx)

      //   response(out).send(res)
      // })
    }
  }

  /**
   * Extend the app context by adding per instance property
   *
   * @param {String} prop
   * @param {Function} fn
   */
  bind (prop: string, fn: (ctx: Context) => any) {
    assert(typeof fn === 'function', `Expect a function but got: ${typeof fn}.`)
    debug(`set a per-request context property: ${prop}`)
    this._context.bind(prop, fn)
    return this
  }

  /**
   * Extend the app context by adding shared properties
   *
   * @param prop
   * @param value
   */
  set (prop: string, value: any) {
    debug(`set a shared context property: ${prop}`)
    this._context.set(prop, value)
    return this
  }

  /**
   * Get a value from the app context
   *
   * @param {String} prop
   */
  get (prop: string) {
    return this._context.get(prop)
  }

  /**
   * Check if the prop is defined in the app context
   *
   * @param {String} prop
   * @returns {Boolean}
   */
  has (prop: string) {
    return this._context.has(prop)
  }

  /**
   * Shorthand for:
   *
   *     http.createServer(app.callback()).listen(...args)
   */
  listen (): Server {
    return createServer(this.callback()).listen(...arguments)
  }
}
