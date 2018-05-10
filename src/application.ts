
import Request from './request'
import * as assert from 'assert'
import Response from './response'
import * as compose from 'aldo-compose'
import * as createDebugger from 'debug'
import ContextFactory from 'aldo-context'
import { Http2ServerRequest } from 'http2'
import { createServer, IncomingMessage, Server } from 'http'

const debug = createDebugger('aldo:application')

export type Context = { [field: string]: any }

export type Middleware = compose.Middleware<Context>

export default class Application {
  /**
   * Application context
   */
  private _context = new ContextFactory()

  /**
   * Application middlewares
   */
  private _middlewares: Middleware[] = []

  /**
   * Use request middleware
   *
   * @param fn
   */
  public use (fn: Middleware) {
    assert(typeof fn === 'function', `Expect a function but got: ${typeof fn}.`)
    debug(`use middleware: ${fn.name || '<anonymous>'}`)
    this._middlewares.push(fn)
    return this
  }

  /**
   * Return a request listener
   */
  public callback (): (req: IncomingMessage | Http2ServerRequest) => Promise<Response> {
    let dispatch = compose(this._middlewares)

    return (req) => {
      let ctx = this._makeContext(this._makeRequest(req))

      debug(`dispatching: ${req.method} ${req.url}`)

      return dispatch(ctx).then(_ensureResponse)
    }
  }

  /**
   * Extend the app context by adding per instance property
   *
   * @param prop
   * @param fn
   */
  public bind (prop: string, fn: (ctx: Context) => any) {
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
  public set (prop: string, value: any) {
    debug(`set a shared context property: ${prop}`)
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
  public listen (): Server {
    // TODO: Rewrite
    return createServer(this.callback()).listen(...arguments)
  }

  /**
   * Create a request context store
   * 
   * @private
   */
  private _makeContext (request: any): Context {
    var ctx = this._context.create()

    ctx.request = request

    return ctx
  }

  /**
   * Create a request instance
   * 
   * @private
   */
  private _makeRequest (req: IncomingMessage | Http2ServerRequest): Request {
    let { url = '/', method = 'GET', headers, socket } = req
    let instance = new Request(url, method, headers)

    instance.connection = socket
    instance.stream = req

    return instance
  }
}

/**
 * Ensure the given argument is a `Response` instance
 * 
 * @private
 */
function _ensureResponse (arg: any): Response {
  if (arg instanceof Response) return arg

  return new Response(arg)
}
