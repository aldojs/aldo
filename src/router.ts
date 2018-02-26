
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
    return ((route) => {
      this._routes.push(route)
      return route
    })(new Route(path, this._prefix))
  }

  /**
   * Use global middlewares
   * 
   * @param {Function...} fns
   * @returns {Router}
   */
  public use (...fns: Middleware[]) {
    for (let fn of fns) {
      this._middlewares.push(_ensureFunction(fn))
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
  public head (path: string, ...handlers: Middleware[]): Route {
    return this.route(path).head(...this._middlewares.concat(handlers))
  }

  /**
   * Make new route and set the handlers for GET method
   * 
   * @param {String} path
   * @param {Function...} handlers
   * @returns {Route}
   */
  public get (path: string, ...handlers: Middleware[]): Route {
    return this.route(path).get(...this._middlewares.concat(handlers))
  }

  /**
   * Make new route and set the handlers for POST method
   * 
   * @param {String} path
   * @param {Function...} handlers
   * @returns {Route}
   */
  public post (path: string, ...handlers: Middleware[]): Route {
    return this.route(path).post(...this._middlewares.concat(handlers))
  }

  /**
   * Make new route and set the handlers for PUT method
   * 
   * @param {String} path
   * @param {Function...} handlers
   * @returns {Route}
   */
  public put (path: string, ...handlers: Middleware[]): Route {
    return this.route(path).put(...this._middlewares.concat(handlers))
  }

  /**
   * Make new route and set the handlers for PATCH method
   * 
   * @param {String} path
   * @param {Function...} handlers
   * @returns {Route}
   */
  public patch (path: string, ...handlers: Middleware[]): Route {
    return this.route(path).patch(...this._middlewares.concat(handlers))
  }

  /**
   * Make new route and set the handlers for DELETE method
   * 
   * @param {String} path
   * @param {Function...} handlers
   * @returns {Route}
   */
  public delete (path: string, ...handlers: Middleware[]): Route {
    return this.route(path).delete(...this._middlewares.concat(handlers))
  }

  /**
   * Make new route and set the handlers for OPTIONS method
   * 
   * @param {String} path
   * @param {Function...} handlers
   * @returns {Route}
   */
  public options (path: string, ...handlers: Middleware[]): Route {
    return this.route(path).options(...this._middlewares.concat(handlers));
  }

  /**
   * Make new route and set the handlers for accepted methods
   * 
   * @param {String} path
   * @param {Function...} handlers
   * @returns {Route}
   */
  public all (path: string, ...handlers: Middleware[]): Route {
    return this.route(path).all(...this._middlewares.concat(handlers))
  }

  /**
   * Make new route and set the handlers for the given HTTP method
   * 
   * @param {Array<String>} methods
   * @param {String} path
   * @param {Function...} handlers
   * @returns {Route}
   */
  public any (methods: string[], path: string, ...handlers: Middleware[]): Route {
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
