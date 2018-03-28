
import Dispatcher from './dispatcher'
import * as createDebugger from 'debug'
import { createServer, Server } from 'http'
import { Route, Handler, Context, Router, Request, Response } from './types'

const debug = createDebugger('aldo:application')

/**
 * A global facade to manage routes, error handlers, dispatching, etc...
 */
export default class Application {
  private _pres: Handler[] = []
  private _posts: Handler[] = []
  private _dispatcher = new Dispatcher(_respond)
  private _context: Context = Object.create(null)

  /**
   * Add before route handler
   * 
   * @param fns
   */
  public pre (...fns: Handler[]): this {
    for (let fn of fns) {
      this._pres.push(_ensureFunction(fn))
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
      this._posts.push(_ensureFunction(fn))
      debug(`use post handler: ${fn.name || '<anonymous>'}`)
    }

    return this
  }

  /**
   * Add an error handler
   * 
   * @param fns
   */
  public catch (...fns: Handler[]): this {
    for (let fn of fns) {
      this._dispatcher.onError(_ensureFunction(fn))
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
    this._dispatcher.onFinished(_ensureFunction(fn))
    debug(`use final handler: ${fn.name || '<anonymous>'}`)
    return this
  }

  /**
   * Register a route handlers
   * 
   * @param method
   * @param path
   * @param fns
   */
  public on (method: string | string[], path: string | string[], ...fns: Handler[]): this {
    if (Array.isArray(path)) {
      for (let _p in path) {
        this._on(method, _p, fns)
      }

      return this
    }

    this._on(method, path, fns)
    return this
  }

  /**
   * Register router's routes
   * 
   * @param routers
   */
  public use (...routers: Router[]): this {
    for (let router of routers) {
      for (let route of router.routes()) {
        for (let [method, fns] of route.handlers()) {
          this._on(method, route.path, fns)
        }
      }
    }

    return this
  }

  /**
   * Return a request handler callback
   */
  public callback (): (request: Request, response: Response) => void {
    return (request: Request, response: Response) => {
      debug(`dispatching: ${request.method} ${request.url}`)
      this._dispatcher.dispatch(this.makeContext(request, response))
    }
  }

  /**
   * Extend the app context by adding per instance property
   * 
   * @param prop
   * @param fn
   */
  public bind (prop: string, fn: (ctx: Context) => any): this {
    var field = `_${prop}`

    _ensureFunction(fn)

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
    ctx.params = {}

    return ctx
  }

  /**
   * Shorthand for:
   * 
   *     http.createServer(app.callback()).listen(...args)
   */
  public listen (): Server {
    return createServer(this.callback() as any).listen(...arguments)
  }

  /**
   * 
   * 
   * @param method
   * @param path
   * @param fns
   * @private
   */
  private _on (method: string | string[], path: string, fns: Handler[]) {
    if (Array.isArray(method)) {
      for (let _m of method)
        this._on(_m, path, fns)

      return
    }

    // Normalize the method name
    method = method.toUpperCase()

    debug(`add handlers for route: ${method} ${path}`)
    this._dispatcher.register(method, path, [...this._pres, ...fns, ...this._posts])
  }
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
  ctx.response.end()
}
