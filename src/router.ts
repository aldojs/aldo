
import Route from './route'
import * as assert from 'assert'
import { Middleware } from './types'

/**
 * Routes factory and manager
 * 
 * @class Router
 */
export default class Router {
  private _middlewares: Middleware[] = []
  private _routes: Route[] = []

  public constructor (private _prefix: string = '') {
    // 
  }

  /**
   * Set the path prefix for all routes
   * 
   * @param {String} value
   * @returns {Router}
   */
  public prefix (value: string) {
    this._prefix = value

    // set the prefix for the registered routes
    for (let route of this._routes) {
      route.prefix(value)
    }

    return this
  }

  /**
   * Get all defined routes
   * 
   * @returns {Array<Route>}
   */
  public routes (): Route[] {
    return this._routes
  }

  /**
   * Create and add a route into the list
   * 
   * @param {String} path
   * @returns {Route}
   */
  public route (path: string): Route {
    let instance = new Route(path, this._prefix)

    this._routes.push(instance)

    return instance
  }

  /**
   * Use global middlewares
   * 
   * @param {Function...} fns
   * @returns {Router}
   */
  public use (...fns: Middleware[]) {
    fns.forEach((fn) => {
      this._middlewares.push(_ensureFunction(fn))
    })

    return this
  }

  public head (path: string, ...handlers: Middleware[]) {
    return this.route(path).head(...this._middlewares.concat(handlers))
  }

  public get (path: string, ...handlers: Middleware[]) {
    return this.route(path).get(...this._middlewares.concat(handlers))
  }

  public post (path: string, ...handlers: Middleware[]) {
    return this.route(path).post(...this._middlewares.concat(handlers))
  }

  public put (path: string, ...handlers: Middleware[]) {
    return this.route(path).put(...this._middlewares.concat(handlers))
  }

  public patch (path: string, ...handlers: Middleware[]) {
    return this.route(path).patch(...this._middlewares.concat(handlers))
  }

  public delete (path: string, ...handlers: Middleware[]) {
    return this.route(path).delete(...this._middlewares.concat(handlers))
  }

  public options (path: string, ...handlers: Middleware[]) {
    return this.route(path).options(...this._middlewares.concat(handlers))
  }

  public all (path: string, ...handlers: Middleware[]) {
    return this.route(path).all(...this._middlewares.concat(handlers))
  }

  public any (methods: string[], path: string, ...handlers: Middleware[]) {
    return this.route(path).any(methods, ...this._middlewares.concat(handlers))
  }
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

  throw new TypeError(`Function expected but got ${typeof arg}`)
}
