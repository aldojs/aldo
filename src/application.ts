
import { format } from 'util'
import { setImmediate } from 'timers'
import ContextFactory from './context'
import * as createDebugger from 'debug'
import * as RadixTree from 'find-my-way'
import { Handler, Context } from './types'
import { createServer, Server } from 'http'
import { dispatch, compose } from './handlers'

const debug = createDebugger('aldo:application')

export type IncomingRequest = { url: string; method: string; }
export type OutgoingResponse = { statusCode: number; end(body?: any): void }

/**
 * A global facade to manage routes, error handlers, dispatching, etc...
 */
export default class Application {
  private _tree = new RadixTree()
  private _presHandlers: Handler[] = []
  private _postsHandlers: Handler[] = []
  private _errorHandlers: Handler[] = []
  private _context = new ContextFactory()
  private _finalHandler: Handler = _respond

  /**
   * Add a pre route handler
   * 
   * @param fns
   */
  public pre (...fns: Handler[]): this {
    for (let fn of fns) {
      this._presHandlers.push(_ensureFunction(fn))
      debug(`use pre handler: ${fn.name || '<anonymous>'}`)
    }

    return this
  }

  /**
   * Add a post route handler
   * 
   * @param fns
   */
  public post (...fns: Handler[]): this {
    for (let fn of fns) {
      this._postsHandlers.push(_ensureFunction(fn))
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
      this._errorHandlers.push(_ensureFunction(fn))
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
    this._finalHandler = _ensureFunction(fn)
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

    if (typeof path === 'string') path = [path]

    for (let _path of path) {
      this._on(method, _path, fns)
    }

    return this
  }

  /**
   * Return a request handler callback
   */
  public callback (): (req: IncomingRequest, res: OutgoingResponse) => any {
    // compose handlers
    var handle = compose(this._combineHandlers())
    var terminate = (ctx: Context) => () => setImmediate(this._finalHandler, ctx)
    var handleError = compose(this._errorHandlers.length > 0 ? this._errorHandlers : [_report])

    // export
    return (req, res) => {
      var ctx = this._context.from(req, res)

      debug(`dispatching: ${req.method} ${req.url}`)

      handle(ctx)
        .catch((err) => {
          ctx.error = err

          return handleError(ctx)
        })
        .then(terminate(ctx))
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

    this._tree.on(method, path, compose(fns))

    debug(`add handlers for route: ${method} ${path}`)
  }

  /**
   * Combine global and route handlers
   * 
   * @param fns
   * @private
   */
  private _combineHandlers (): Handler[] {
    return [
      ...this._presHandlers,
      this._dispatchRoute.bind(this),
      ...this._postsHandlers.reverse()
    ]
  }

  /**
   * Search and invoke the matched route handlers
   * 
   * @param ctx
   * @private
   */
  private _dispatchRoute (ctx: Context): any {
    var { method, url } = ctx.req
    var found = this._tree.find(method, _sanitize(url))

    if (!found) {
      throw new Error(`Route not found: ${method} ${url}`)
    }

    // add url params to the context
    ctx.params = found.params || {}

    // invoke the route handler
    return found.handler(ctx)
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

/**
 * Send the error response
 * 
 * @param ctx
 * @private
 */
function _report ({ error, res }: Context) {
  console.error(error)
  res.statusCode = 500
  res.end(error.message)
}

/**
 * Returns only the pathname
 * 
 * @param url
 * @private
 */
function _sanitize (url: string): string {
  for (var i = 0; i < url.length; i++) {
    var charCode = url.charCodeAt(i)

    //              "?"                "#"
    if (charCode === 63 || charCode === 35) {
      return url.slice(0, i)
    }
  }

  return url
}
