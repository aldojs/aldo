
import * as assert from 'assert'
import is from '@sindresorhus/is'
import * as createDebugger from 'debug'
import { Middleware as IMiddleware, compose } from 'aldo-compose'
import { ContextFactory, Context as IContext } from 'aldo-context'
import { Request, createServer, Server, RequestHandler, Response } from 'aldo-http'

const debug = createDebugger('aldo:application')

export type Middleware = IMiddleware<Context>

export type ResponseFactory = (body?: any) => Response

export interface Context extends IContext {
  response: ResponseFactory
  request: Request
}

export class Application {
  /**
   * The context factory
   * 
   * @private
   */
  private _context = new ContextFactory<Context>()

  /**
   * The middleware dispatcher
   * 
   * @private
   */
  private _middlewares: Middleware[] = []

  /**
   * Initialize a new application
   * 
   * @public
   */
  public constructor () {
    this._initializeContext()
  }

  /**
   * Use a middleware
   *
   * @param fn
   * @public
   */
  public use (fn: Middleware) {
    assert(is.function_(fn), `Expect a function but got: ${is(fn)}.`)
    debug(`use middleware: ${fn.name || '<anonymous>'}`)
    this._middlewares.push(fn)
    return this
  }

  /**
   * Get the request handler
   * 
   * @param request
   * @public
   */
  public callback (): RequestHandler {
    let dispatch = compose(this._middlewares)

    return (request) => {
      debug(`dispatching: ${request.method} ${request.url}`)
      return dispatch(this._createContext(request))
    }
  }

  /**
   * Extend the app context by adding per instance property
   *
   * @param prop
   * @param fn
   * @public
   */
  public bind (prop: string, fn: (ctx: Context) => any) {
    assert(is.function_(fn), `Expect a function but got: ${is(fn)}.`)
    debug(`set a per-request context property: ${prop}`)
    this._context.bind(prop, fn)
    return this
  }

  /**
   * Extend the app context by adding shared properties
   *
   * @param prop
   * @param value
   * @public
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
   * @public
   */
  public get (prop: string): any {
    return this._context.get(prop)
  }

  /**
   * Check if the prop is defined in the app context
   *
   * @param prop
   * @public
   */
  public has (prop: string): boolean {
    return this._context.has(prop)
  }

  /**
   * Shorthand for:
   *
   *     createServer(app.callback()).start(...arguments)
   * 
   * @public
   */
  public async start (...args: any[]): Promise<Server> {
    let server = createServer(this.callback())

    await server.start(...args)

    return server
  }

  /**
   * Create a request context
   * 
   * @param request The incoming request
   * @private
   */
  private _createContext (request: Request): Context {
    let ctx = this._context.create()

    // add the incoming request
    ctx.request = request

    return ctx
  }

  /**
   * Initialize the built-in context properties
   * 
   * @private
   */
  private _initializeContext () {
    // Add the response factory
    this._context.set('response', (body?: any) => {
      return body instanceof Response ? body : new Response(body)
    })
  }
}
