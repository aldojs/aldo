
import Route from './route'
import * as assert from 'assert'
import { Handler } from './types'
import * as createDebugger from 'debug'

const debug = createDebugger('aldo:router')

/**
 * Routes factory and manager
 * 
 * @class Router
 */
export default class Router {
  private _handlers: Handler[] = []
  private _routes: Route[] = []

  public constructor (private _prefix = '') {
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
    debug(`update route prefix to ${this._prefix}`)

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
    var route = new Route(path, this._prefix)

    debug(`create route for ${path}`)
    this._routes.push(route)

    return route
  }

  /**
   * Use global handlers
   * 
   * @param {Function...} fns
   * @returns {Router}
   */
  public use (...fns: Handler[]) {
    for (let fn of fns) {
      this._handlers.push(_ensureFunction(fn))
      debug(`use route handler: ${fn.name || '<anonymous>'}`)
    }

    return this
  }

  /**
   * Make new route and set the handlers for HEAD method
   * 
   * @param {String} path
   * @param {Function...} handlers
   * @returns {Route}
   */
  public head (path: string, ...handlers: Handler[]): Route {
    return this.route(path).head(...this._handlers.concat(handlers))
  }

  /**
   * Make new route and set the handlers for GET method
   * 
   * @param {String} path
   * @param {Function...} handlers
   * @returns {Route}
   */
  public get (path: string, ...handlers: Handler[]): Route {
    return this.route(path).get(...this._handlers.concat(handlers))
  }

  /**
   * Make new route and set the handlers for POST method
   * 
   * @param {String} path
   * @param {Function...} handlers
   * @returns {Route}
   */
  public post (path: string, ...handlers: Handler[]): Route {
    return this.route(path).post(...this._handlers.concat(handlers))
  }

  /**
   * Make new route and set the handlers for PUT method
   * 
   * @param {String} path
   * @param {Function...} handlers
   * @returns {Route}
   */
  public put (path: string, ...handlers: Handler[]): Route {
    return this.route(path).put(...this._handlers.concat(handlers))
  }

  /**
   * Make new route and set the handlers for PATCH method
   * 
   * @param {String} path
   * @param {Function...} handlers
   * @returns {Route}
   */
  public patch (path: string, ...handlers: Handler[]): Route {
    return this.route(path).patch(...this._handlers.concat(handlers))
  }

  /**
   * Make new route and set the handlers for DELETE method
   * 
   * @param {String} path
   * @param {Function...} handlers
   * @returns {Route}
   */
  public delete (path: string, ...handlers: Handler[]): Route {
    return this.route(path).delete(...this._handlers.concat(handlers))
  }

  /**
   * Make new route and set the handlers for OPTIONS method
   * 
   * @param {String} path
   * @param {Function...} handlers
   * @returns {Route}
   */
  public options (path: string, ...handlers: Handler[]): Route {
    return this.route(path).options(...this._handlers.concat(handlers));
  }

  /**
   * Make new route and set the handlers for accepted methods
   * 
   * @param {String} path
   * @param {Function...} handlers
   * @returns {Route}
   */
  public all (path: string, ...handlers: Handler[]): Route {
    return this.route(path).all(...this._handlers.concat(handlers))
  }

  /**
   * Make new route and set the handlers for the given HTTP method
   * 
   * @param {Array<String>} methods
   * @param {String} path
   * @param {Function...} handlers
   * @returns {Route}
   */
  public any (methods: string[], path: string, ...handlers: Handler[]): Route {
    return this.route(path).any(methods, ...this._handlers.concat(handlers))
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
