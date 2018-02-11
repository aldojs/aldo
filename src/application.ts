
import { Server } from 'http'
import Engine from './engine'
import { setImmediate } from 'timers'
// import * as createDebugger from 'debug'
import * as TreeRouter from 'find-my-way'
import { Request, Response, createServer } from 'aldo-http'
import { Route, Middleware, Context, FinalHandler, Router } from './types'

export default class Application {
  private _context: Context = { app: this } as any
  private _namedRoutes = new Map<string, Route>()
  private _engine = new Engine(_respond)
  private _posts: Middleware[] = []
  private _pres: Middleware[] = []
  private _tree = new TreeRouter()

  /**
   * Add before route middleware
   * 
   * @param {Function} fn
   * @returns {Application}
   */
  pre (fn: Middleware) {
    _assertFunction(fn)
    this._pres.push(fn)
    return this
  }

  /**
   * Add after route middleware
   * 
   * @param {Function} fn
   * @returns {Application}
   */
  post (fn: Middleware) {
    _assertFunction(fn)
    this._posts.push(fn)
    return this
  }

  /**
   * Add error middleware
   * 
   * @param {Function} fn
   * @returns {Application}
   */
  catch (fn: Middleware) {
    _assertFunction(fn)
    this._engine.onError(fn)
    return this
  }

  /**
   * Set the final request handler
   * 
   * @param {Function} fn
   * @returns {Application}
   */
  finally (fn: FinalHandler) {
    _assertFunction(fn, 'The final handler should be a function')
    this._engine.onEnd(fn)
    return this
  }

  /**
   * Use router's routes into the tree
   * 
   * @param {Router} router
   * @returns {Application}
   */
  use (router: Router) {
    for (let route of router.routes()) {
      for (let [method, fns] of route.handlers()) {
        this._tree.on(method, route.path, this._compose(fns))
      }

      // register named route
      if (route.name) this._namedRoutes.set(route.name, route)
    }

    return this
  }

  /**
   * Dispatch the request/response to the matched route handler
   * 
   * @param {Request} request
   * @param {Response} response
   */
  dispatch (request: Request, response: Response): void {
    var { method, url } = request
    var found = this._tree.find(method, url)
    var ctx = this._makeContext(request, response)

    // debug(`dispatch ${method} ${url}`)

    // 404
    if (!found) {
      let err = _notFoundError(url)

      this._engine.catch(err, ctx)
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
   */
  serve (...args: any[]): Server {
    return createServer(this.dispatch.bind(this)).listen(...args)
  }

  /**
   * Extend the context by adding more properties
   * 
   * @param {String} prop
   * @param {Any} value
   * @returns {Application}
   */
  set (prop: string, value: any) {
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
  get (prop: string) {
    return this._context[prop]
  }

  /**
   * Check if the prop is defined in the context
   * 
   * @param {String} prop
   * @returns {Boolean}
   */
  has (prop: string) {
    return prop in this._context
  }

  /**
   * Create a new copy of the context object
   * 
   * @param {Object} request
   * @param {Object} response
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
   * 
   * 
   * @param {Array<Function>} fns
   * @returns {Function}
   * @private
   */
  private _compose (fns: Middleware[]): FinalHandler {
    var handlers = [...this._pres, ...fns, ...this._posts]

    return (ctx: Context) => this._engine.try(ctx, handlers)
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
 * Ensure the given argument is a middleware function
 * 
 * @param {Any} arg
 * @param {String} [msg]
 * @returns {Function}
 * @private
 */
function _assertFunction (arg: any, msg?: string) {
  if (typeof arg === 'function') return arg

  throw new Error(msg || 'The middleware should be a function')
}

/**
 * Send the response
 * 
 * @private
 */
function _respond ({ response }: Context) {
  response.send()
}
