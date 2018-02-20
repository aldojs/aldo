
import { join } from 'path'
import * as assert from 'assert'
import { Middleware, FinalHandler } from './types'

const METHODS = ['HEAD', 'GET', 'PATCH', 'POST', 'PUT', 'DELETE', 'OPTIONS']

/**
 * Route container
 * 
 * @class Route
 */
export default class Route {
  private _handlers = new Map<string, Middleware[]>()
  private _prefix: string
  private _name: string
  private _path: string

  /**
   * Initialize a new route instance
   * 
   * @param {String} path
   * @param {String} [prefix]
   * @constructor
   */
  public constructor (path: string, prefix: string = '') {
    this._prefix = _normalize(prefix)
    this._path = _normalize(path)
    this._name = ''
  }

  /**
   * The route path
   * 
   * @type {String}
   */
  public get path (): string {
    return join(this._prefix, this._path)
  }

  /**
   * The route name
   * 
   * @type {String}
   */
  public get name (): string {
    return this._name
  }

  /**
   * Set the route name
   * 
   * @param {String} name
   * @returns {Route}
   */
  public as (name: string) {
    this._name = name
    return this
  }

  /**
   * Set the route prefix
   * 
   * @param {String} path
   * @returns {Route}
   * 
   * @todo add test case for "/" path
   */
  public prefix (path: string) {
    this._prefix = _normalize(path)
    return this
  }

  /**
   * Get an iterator of the route handlers
   * 
   * @returns {Array<[String, Array<Function>]>}
   */
  public handlers (): [string, Middleware[]][] {
    return Array.from(this._handlers)
  }

  /**
   * Set handlers for HEAD method
   * 
   * @param {Function...} fns
   * @returns {Route}
   */
  public head (...fns: Middleware[]) {
    return this.any(['HEAD'], ...fns)
  }

  /**
   * Set handlers for HEAD and GET methods
   * 
   * @param {Function...} fns
   * @returns {Route}
   */
  public get (...fns: Middleware[]) {
    return this.any(['HEAD', 'GET'], ...fns)
  }

  /**
   * Set handlers for POST method
   * 
   * @param {Function...} fns
   * @returns {Route}
   */
  public post (...fns: Middleware[]) {
    return this.any(['POST'], ...fns)
  }

  /**
   * Set handlers for PUT method
   * 
   * @param {Function...} fns
   * @returns {Route}
   */
  public put (...fns: Middleware[]) {
    return this.any(['PUT'], ...fns)
  }

  /**
   * Set handlers for PATCH method
   * 
   * @param {Function...} fns
   * @returns {Route}
   */
  public patch (...fns: Middleware[]) {
    return this.any(['PATCH'], ...fns)
  }

  /**
   * Set handlers for DELETE method
   * 
   * @param {Function...} fns
   * @returns {Route}
   */
  public delete (...fns: Middleware[]) {
    return this.any(['DELETE'], ...fns)
  }

  /**
   * Set handlers for OPTIONS method
   * 
   * @param {Function...} fns
   * @returns {Route}
   */
  public options (...fns: Middleware[]) {
    return this.any(['OPTIONS'], ...fns)
  }

  /**
   * Set handlers for the all accepted HTTP methods
   * 
   * Only 'HEAD', 'GET', 'PATCH', 'POST', 'PUT', 'DELETE', 'OPTIONS' are available
   * 
   * @param {Function...} fns
   * @returns {Route}
   */
  public all (...fns: Middleware[]) {
    return this.any(METHODS, ...fns)
  }

  /**
   * Set handlers for the given HTTP methods
   * 
   * Only 'HEAD', 'GET', 'PATCH', 'POST', 'PUT', 'DELETE', 'OPTIONS' are accepted
   * 
   * @param {Array<String>} methods
   * @param {Function...} fns
   * @returns {Route}
   */
  public any (methods: string[], ...fns: Middleware[]) {
    assert(fns.length, 'At least one route handler is required.')

    fns.forEach((fn) => {
      assert(typeof fn === 'function', 'Route handler must be a function.')
    })

    // wrap the final handler
    fns = _wrapFinalHandler(fns)

    for (let method of methods) {
      assert(!this._handlers.has(method), `Method '${method}' already defined for "${this.path}"`)
      assert(METHODS.includes(method.toUpperCase()), `Method '${method}' not accepted.`)

      this._handlers.set(method, fns)
    }

    return this
  }
}

/**
 * Normalize the URL path
 * 
 * @param {String} path
 * @returns {String}
 * @private
 */
function _normalize (path: string): string {
  if (path.endsWith('/')) path = path.slice(0, -1)

  if (!path.startsWith('/')) path = '/' + path

  return path
}

/**
 * Wrap the last middleware function
 * 
 * @param {Array<Function>} handlers
 * @returns {Array<Function>}
 * @private
 */
function _wrapFinalHandler (handlers: Middleware[]) {
  let fn = handlers.pop() as FinalHandler

  handlers.push(_wrapper(fn))

  return handlers
}

/**
 * Get the final handler wrapper
 * 
 * @param {Function} fn
 * @returns {Function}
 * @private
 */
function _wrapper (fn: FinalHandler): Middleware {
  return async (ctx, next) => {
    try {
      var result = await fn(ctx)

      if (result instanceof Error) {
        next(result)
        return
      }

      if (result && !ctx.response.body) {
        ctx.response.body = result
      }

      next()
    } catch (error) {
      next(error)
    }
  }
}
