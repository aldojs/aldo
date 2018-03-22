
import { ListenOptions } from 'net'
import { setImmediate } from 'timers'
import * as createDebugger from 'debug'
import makeCollection from './support/handlers'
import makeDispatcher from './support/dispatcher'
import { Route, Handler, Context, Router } from './types'
import { Request, Response, Server, createServer, CreateServerOptions } from 'aldo-http'

const debug = createDebugger('aldo:application')

/**
 * A global facade to manage routes, error handlers, dispatching, etc...
 */
export default class Application {
  private _server?: Server
  private _routes: Route[] = []
  private _preHandlers: Handler[] = []
  private _postHandlers: Handler[] = []
  private _errorHandlers: Handler[] = []
  private _finalHandler: Handler = _respond
  private _context: Context = Object.create(null)
  private _dispatcher = makeDispatcher(this._errorHandlers)
  private _handlers = makeCollection((ctx: Context) => {
    ctx.error = _notFoundError('Not Found')

    this._dispatcher.dispatch(ctx, this._errorHandlers, this._finalHandler)
  })

  /**
   * Add before route handler
   * 
   * @param fns
   */
  public pre (...fns: Handler[]): this {
    for (let fn of fns) {
      this._preHandlers.push(_ensureFunction(fn))
      debug(`use pre handler: ${fn.name || '<anonymous>'}`)
    }

    return this
  }

  /**
   * Add after route handler
   * 
   * @param fns
   */
  public post (...fns: Handler[]): this {
    for (let fn of fns) {
      this._postHandlers.push(_ensureFunction(fn))
      debug(`use post handler: ${fn.name || '<anonymous>'}`)
    }

    return this
  }

  /**
   * Add error handler
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
   * Set the final request handler
   * 
   * @param fn final request handler
   */
  public finally (fn: Handler): this {
    this._finalHandler = _ensureFunction(fn)
    debug(`use final handler: ${fn.name || '<anonymous>'}`)
    return this
  }

  /**
   * Add router's routes into the tree
   * 
   * @param routers
   */
  public use (...routers: Router[]): this {
    for (let router of routers) {
      this._routes.push(...router.routes())
      debug('use routes')
    }

    return this
  }

  /**
   * Return a request handler callback
   */
  public callback (): (request: Request, response: Response) => void {
    this._compileRoutes()

    return (request: Request, response: Response) => {
      debug(`dispatching: ${request.method} ${request.url}`)
      this._handlers.invoke(this.makeContext(request, response))
    }
  }

  /**
   * Start listening for requests
   * 
   * @param listenOptions
   * @param serverOptions
   */
  public async start (listenOptions: ListenOptions, serverOptions?: CreateServerOptions): Promise<Server>
  /**
   * Start listening for requests
   * 
   * @param port
   * @param options
   */
  public async start (port: number, options?: CreateServerOptions): Promise<Server>
  public async start (arg: any, options: any = {}) {
    var server = this._server = createServer(options, this.callback())

    if (typeof arg === 'number') arg = { port: arg }

    // listen
    await server.start(arg)
    debug(`app started with %o`, arg)
    return server
  }

  /**
   * Stop listening for requests
   */
  public async stop (): Promise<Server> {
    var server = this._server as Server

    await server.stop()
    debug(`app stopped`)
    return server
  }

  /**
   * Extend the app context by adding per instance property
   * 
   * @param prop
   * @param fn
   */
  public bind (prop: string, fn: (ctx: Context) => any): this {
    _ensureFunction(fn)

    var field = `_${prop}`

    Reflect.defineProperty(this._context, prop, {
      configurable: true,
      enumerable: true,
      get () {
        if ((this as Context)[field] === undefined) {
          // private property
          Reflect.defineProperty(this, field, {
            value: fn(this as Context)
          })
        }

        return (this as Context)[field]
      }
    })

    return this
  }

  /**
   * Extend the app context by adding shared properties
   * 
   * @param prop
   * @param value
   */
  public set (prop: string, value: any): this {
    if (typeof value === 'function') {
      return this.bind(prop, value)
    }

    this._context[prop] = value
    return this
  }

  /**
   * Get a value from the app context
   * 
   * @param prop
   */
  public get (prop: string): any {
    return this._context[prop]
  }

  /**
   * Check if the prop is defined in the app context
   * 
   * @param prop
   */
  public has (prop: string): boolean {
    return prop in this._context
  }

  /**
   * Create a new copy of the context object
   * 
   * @param request
   * @param response
   */
  public makeContext (request: Request, response: Response): Context {
    var ctx: Context = Object.create(this._context)

    ctx.response = response
    ctx.request = request
    ctx.app = this

    return ctx
  }

  /**
   * Construct the routes tree
   * 
   * @private
   */
  private _compileRoutes (): void {
    for (let route of this._routes) {
      for (let [method, fns] of route.handlers()) {
        this._handlers.add(method, route.path, this._compose(fns))
      }

      // TODO register named routes
    }

    // reset the handlers
    this._routes = []
  }

  /**
   * Compose the given handlers into a callable function
   * 
   * @param fns
   * @private
   */
  private _compose (fns: Handler[]): Handler {
    var handlers = [...this._preHandlers, ...fns, ...this._postHandlers]

    return this._dispatcher.compile(handlers, this._finalHandler)
  }
}

/**
 * Create a 404 error instance
 * 
 * @param msg
 * @private
 */
function _notFoundError (msg: string) {
  var error: any = new Error(msg)

  error.code = 'NOT_FOUND'
  error.expose = true
  error.status = 404

  return error
}

/**
 * Ensure the given argument is a function
 * 
 * @param arg
 * @private
 */
function _ensureFunction<T> (arg: T): T {
  if (typeof arg === 'function') return arg

  throw new TypeError(`Function expected but ${typeof arg} given.`)
}

/**
 * Send the response
 * 
 * @param ctx
 * @private
 */
function _respond (ctx: Context) {
  ctx.response.send()
}
