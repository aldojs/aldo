
import Route from './route'
import * as assert from 'assert'
import { Middleware } from './types'

export default class Router {
  private _middlewares: Middleware[] = []
  private _routes: Route[] = []
  private _prefix: string = ''

  prefix (value: string) {
    this._prefix = value

    for (let route of this._routes) {
      route.prefix(value)
    }

    return this
  }

  routes () {
    return this._routes
  }

  route (path: string): Route {
    let instance = new Route(path).prefix(this._prefix)

    this._routes.push(instance)

    return instance
  }

  use (fn: Middleware) {
    assert(typeof fn === 'function', 'Route middleware should be a function')

    this._middlewares.push(fn)
  }

  head (path: string, ...handlers: Middleware[]) {
    return this.route(path).head(...this._middlewares.concat(handlers))
  }

  get (path: string, ...handlers: Middleware[]) {
    return this.route(path).get(...this._middlewares.concat(handlers))
  }

  post (path: string, ...handlers: Middleware[]) {
    return this.route(path).post(...this._middlewares.concat(handlers))
  }

  put (path: string, ...handlers: Middleware[]) {
    return this.route(path).put(...this._middlewares.concat(handlers))
  }

  patch (path: string, ...handlers: Middleware[]) {
    return this.route(path).patch(...this._middlewares.concat(handlers))
  }

  delete (path: string, ...handlers: Middleware[]) {
    return this.route(path).delete(...this._middlewares.concat(handlers))
  }

  options (path: string, ...handlers: Middleware[]) {
    return this.route(path).options(...this._middlewares.concat(handlers))
  }

  all (path: string, ...handlers: Middleware[]) {
    return this.route(path).all(...this._middlewares.concat(handlers))
  }

  any (methods: string[], path: string, ...handlers: Middleware[]) {
    return this.route(path).any(methods, ...this._middlewares.concat(handlers))
  }
}
