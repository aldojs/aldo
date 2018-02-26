
import { Server } from 'http'
import { setImmediate } from 'timers'
// import * as createDebugger from 'debug'
import * as TreeRouter from 'find-my-way'
import { Request, Response, createServer } from 'aldo-http'
import { Route, Middleware, Context, FinalHandler, Router } from './types'

/**
 * A global facade to manage routes, error handlers
 * 
 * @class Application
 */
export default class Application {
  private _context: Context = { app: this } as any
  // private _namedRoutes = new Map<string, Route>()
  private _finally: FinalHandler = _respond
  private _catchers: Middleware[] = []
  private _posts: Middleware[] = []
  private _pres: Middleware[] = []
  private _tree = new TreeRouter()

  /**
   * Add before route middleware
   * 
   * @param {Function...} fns
   * @returns {Application}
   */
  public pre (...fns: Middleware[]) {
    for (let fn of fns) {
      this._pres.push(_ensureFunction(fn))
    }

    return this
  }

  /**
   * Add after route middleware
   * 
   * @param {Function...} fns
   * @returns {Application}
   */
  public post (...fns: Middleware[]) {
    for (let fn of fns) {
      this._posts.push(_ensureFunction(fn))
    }

    return this
  }

  /**
   * Add error middleware
   * 
   * @param {Function...} fns
   * @returns {Application}
   */
  public catch (...fns: Middleware[]) {
    for (let fn of fns) {
      this._catchers.push(_ensureFunction(fn))
    }

    return this
  }

  /**
   * Set the final request handler
   * 
   * @param {Function} fn
   * @returns {Application}
   */
  public finally (fn: FinalHandler) {
    this._finally = _ensureFunction(fn)
    return this
  }

  /**
   * Add router's routes into the tree
   * 
   * @param {Router...} routers
   * @returns {Application}
   */
  public use (...routers: Router[]) {
    for (let router of routers) {
      for (let route of router.routes()) {
        for (let [method, fns] of route.handlers()) {
          this._tree.on(method, route.path, this._compose(fns))
        }

        // TODO register named route
        // if (route.name) this._namedRoutes.set(route.name, route)
      }
    }

    return this
  }

  /**
   * Dispatch the request/response to the matched route handler
   * 
   * @param {Request} request
   * @param {Response} response
   */
  public dispatch (request: Request, response: Response): void {
    var { method, url } = request
    var found = this._tree.find(method, url)
    var ctx = this._makeContext(request, response)

    // debug(`dispatch ${method} ${url}`)

    // 404
    if (!found) {
      let err = _notFoundError(url)

      this._loopError(err, ctx)
      return
    }

    // add url params to the context
    ctx.params = found.params || {}

    // invoke the route handler
    found.handler(ctx)
  }

  /**
   * Create a HTTP server and pass the arguments to `listen` method
   * 
   * @param {Any...} args
   * @returns {Server}
   */
  public serve (...args: any[]): Server {
    return createServer(this.dispatch.bind(this)).listen(...args)
  }

  /**
   * Extend the app context by adding more properties
   * 
   * @param {String} prop
   * @param {Any} value
   * @returns {Application}
   */
  public set (prop: string, value: any) {
    var descriptor: PropertyDescriptor = {
      configurable: true,
      enumerable: true
    }

    // factory
    if (typeof value === 'function') {
      let fn = value
      let field = `_${prop}`

      descriptor.get = function _get () {
        return (this as Context)[field] || ((this as Context)[field] = fn(this))
      }
    }
    else {
      descriptor.value = value
    }

    // define
    Object.defineProperty(this._context, prop, descriptor)

    return this
  }

  /**
   * Get a value from the app context
   * 
   * @param {String} prop
   * @returns {Any}
   */
  public get (prop: string) {
    return this._context[prop]
  }

  /**
   * Check if the prop is defined in the app context
   * 
   * @param {String} prop
   * @returns {Boolean}
   */
  public has (prop: string) {
    return prop in this._context
  }

  /**
   * Create a new copy of the context object
   * 
   * @param {Request} request
   * @param {Response} response
   * @returns {Object}
   * @private
   */
  private _makeContext (request: Request, response: Response) {
    var ctx: Context = Object.create(this._context)

    ctx.response = response
    ctx.request = request

    return ctx
  }

  /**
   * Compose the middleware list into a callable function
   * 
   * @param {Array<Function>} fns
   * @returns {Function}
   * @private
   */
  private _compose (fns: Middleware[]): FinalHandler {
    var handlers = [...this._pres, ...fns, ...this._posts]

    return (ctx: Context) => this._loopMiddleware(ctx, handlers)
  }

  /**
   * Loop over the route middlewares
   * 
   * @param {Object} ctx
   * @param {Array<Function>} fns
   */
  private _loopMiddleware (ctx: Context, fns: Middleware[]) {
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
   * @param {Error} err
   * @param {Object} ctx
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
 * @param {String} path
 * @returns {Error}
 * @private
 */
function _notFoundError (path: string) {
  var msg = `Route not found for "${path}".`
  var error: any = new Error(msg)

  error.code = 'NOT_FOUND'
  error.expose = true
  error.status = 404

  return error
}

/**
 * Ensure the given argument is a function
 * 
 * @param {Any} arg
 * @returns {Function}
 * @private
 */
function _ensureFunction<T> (arg: T): T {
  if (typeof arg === 'function') return arg

  throw new TypeError(`Function expected but ${typeof arg} given.`)
}

/**
 * Send the response
 * 
 * @param {Object} context
 * @private
 */
function _respond ({ response }: Context) {
  response.send()
}
