
import { ListenOptions } from 'net'
import { setImmediate } from 'timers'
import * as createDebugger from 'debug'
import * as TreeRouter from 'find-my-way'
import { Route, Middleware, Context, FinalHandler, Router } from './types'
import { Request, Response, Server, createServer, CreateServerOptions } from 'aldo-http'

const debug = createDebugger('aldo:application')

/**
 * A global facade to manage routes, error handlers, dispatching, etc...
 */
export default class Application {
  private _context: Context = Object.create(null)
  private _finally: FinalHandler = _respond
  private _catchers: Middleware[] = []
  private _posts: Middleware[] = []
  private _pres: Middleware[] = []
  private _tree = new TreeRouter()
  private _server: Server

  /**
   * Add before route middleware
   * 
   * @param fns
   */
  public pre (...fns: Middleware[]): this {
    for (let fn of fns) {
      this._pres.push(_ensureFunction(fn))
      debug(`use pre middleware: ${fn.name || '<anonymous>'}`)
    }

    return this
  }

  /**
   * Add after route middleware
   * 
   * @param fns
   */
  public post (...fns: Middleware[]): this {
    for (let fn of fns) {
      this._posts.push(_ensureFunction(fn))
      debug(`use post middleware: ${fn.name || '<anonymous>'}`)
    }

    return this
  }

  /**
   * Add error middleware
   * 
   * @param fns
   */
  public catch (...fns: Middleware[]): this {
    for (let fn of fns) {
      this._catchers.push(_ensureFunction(fn))
      debug(`use error middleware: ${fn.name || '<anonymous>'}`)
    }

    return this
  }

  /**
   * Set the final request handler
   * 
   * @param fn final request handler
   */
  public finally (fn: FinalHandler): this {
    this._finally = _ensureFunction(fn)
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
      for (let route of router.routes()) {
        for (let [method, fns] of route.handlers()) {
          this._tree.on(method, route.path, this._compose(fns))
        }

        // TODO register named routes
      }
    }

    return this
  }

  /**
   * Dispatch the request/response to the matched route handler
   * 
   * @param request
   * @param response
   */
  public dispatch (request: Request, response: Response): void {
    var { method, url } = request
    var found = this._tree.find(method, url)
    var ctx = this.makeContext(request, response)

    debug(`dispatching: ${method} ${url}`)

    // 404
    if (!found) {
      let err = _notFoundError(`Route not found for ${method} ${url}`)

      debug(`handler not found: ${method} ${url}`)
      return this._loopError(err, ctx)
    }

    // add url params to the context
    ctx.params = found.params || {}

    // invoke the route handler
    found.handler(ctx)
  }

  /**
   * Start listening for requests
   * 
   * @param opts
   * @param options
   */
  public async start (opts: ListenOptions, options?: CreateServerOptions): Promise<Server>
  /**
   * Start listening for requests
   * 
   * @param port
   * @param options
   */
  public async start (port: number, options?: CreateServerOptions): Promise<Server>
  public async start (one: any, two: any = {}) {
    this._server = createServer(two, this.dispatch.bind(this))

    if (typeof one === 'number') one = { port: one }

    // listen
    await this._server.start(one)

    debug(`app started with %o`, one)

    return this._server
  }

  /**
   * Stop listening for requests
   */
  public async stop (): Promise<Server> {
    await this._server.stop()

    debug(`app stopped`)

    return this._server
  }

  /**
   * Extend the app context by adding per instance attribute
   * 
   * @param prop
   * @param fn factory function
   */
  public bind (prop: string, fn: (ctx: Context) => any): this {
    var field = `_${prop}`

    Object.defineProperty(this._context, prop, {
      enumerable: true,
      configurable: true,
      get: function _get () {
        return (this as Context)[field] || ((this as Context)[field] = fn(this as Context))
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
   * Compose the middleware list into a callable function
   * 
   * @param fns middlewares
   * @private
   */
  private _compose (fns: Middleware[]): FinalHandler {
    var handlers = [...this._pres, ...fns, ...this._posts]

    return (ctx: Context) => this._loopMiddleware(ctx, handlers)
  }

  /**
   * Loop over the route middlewares
   * 
   * @param ctx
   * @param fns
   * @private
   */
  private _loopMiddleware (ctx: Context, fns: Middleware[]): void {
    var i = 0

    var next = (err?: any) => {
      if (!ctx.error && err) {
        this._loopError(err, ctx)
        return
      }

      var fn = fns[i++]

      if (!fn) {
        fn = this._finally
        next = undefined as any
      }

      // async call
      setImmediate(fn, ctx, next)
    }

    next()
  }

  /**
   * Loop over the error middlewares
   * 
   * @param err
   * @param ctx
   * @private
   */
  private _loopError (err: any, ctx: Context) {
    // TODO ensure `err` is an Error instance

    // set the context error
    ctx.error = err

    this._loopMiddleware(ctx, this._catchers)
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
