
import Dispatcher from './dispatcher'
import ContextFactory from './context'
import * as createDebugger from 'debug'
import { createServer, Server } from 'http'
import { Handler, Context, Request, Response } from './types'

const debug = createDebugger('aldo:application')

/**
 * A global facade to manage routes, error handlers, dispatching, etc...
 */
export default class Application {
  private _pres: Handler[] = []
  private _posts: Handler[] = []
  private _context = new ContextFactory()
  private _dispatcher = new Dispatcher(_respond)

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
   * @param fn
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
    fns.forEach(_ensureFunction)

    // combine handlers
    fns = this._combine(fns)

    if (typeof path === 'string') path = [path]

    for (let _path in path) {
      this._on(method, _path, fns)
    }

    return this
  }

  /**
   * Return a request handler callback
   */
  public callback (): (req: Request, res: Response) => void {
    return (req: Request, res: Response) => {
      debug(`dispatching: ${req.method} ${req.url}`)
      this._dispatcher.dispatch(this._context.from(req, res))
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

    this._dispatcher.register(method, path, fns)

    debug(`add handlers for route: ${method} ${path}`)
  }

  /**
   * Combine global and route handlers
   * 
   * @param fns
   */
  private _combine (fns: Handler[]): Handler[] {
    return [...this._pres, ...fns, ...this._posts.reverse()]
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
function _respond ({ res }: Context) {
  res.end()
}
