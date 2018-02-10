
import { join } from 'path'
import * as assert from 'assert'
import { Context, Middleware, RouteHandler } from './types'

export default class Route {
  private _handlers = new Map<string, Middleware[]>()
  private _prefix: string = ''
  private _path: string
  private _name: string

  constructor (path: string) {
    this._path = _normalize(path)
  }

  get path (): string {
    return join(this._prefix, this._path)
  }

  get name (): string {
    return this._name
  }

  /**
   * Set the route name
   * 
   * @param {String} name
   * @returns {this}
   */
  as (name: string) {
    this._name = name
    return this
  }

  /**
   * Set the route prefix
   * 
   * @param {String} path
   * @returns {this}
   * 
   * @todo add test case for "/" path
   */
  prefix (path: string) {
    this._prefix = _normalize(path)
    return this
  }

  handlers () {
    return this._handlers.entries()
  }

  head (...fns: Middleware[]) {
    return this.any(['HEAD'], ...fns)
  }

  get (...fns: Middleware[]) {
    return this.any(['HEAD', 'GET'], ...fns)
  }

  post (...fns: Middleware[]) {
    return this.any(['POST'], ...fns)
  }

  put (...fns: Middleware[]) {
    return this.any(['PUT'], ...fns)
  }

  patch (...fns: Middleware[]) {
    return this.any(['PATCH'], ...fns)
  }

  delete (...fns: Middleware[]) {
    return this.any(['DELETE'], ...fns)
  }

  options (...fns: Middleware[]) {
    return this.any(['OPTIONS'], ...fns)
  }

  all (...fns: Middleware[]) {
    return this.any(['HEAD', 'GET', 'PATCH', 'POST', 'PUT', 'DELETE', 'OPTIONS'], ...fns)
  }

  any (methods: string[], ...fns: Middleware[]) {
    assert(fns.length, 'At least one route handler is required.')

    fns.forEach((fn) => {
      assert(typeof fn === 'function', 'Route handler must be a function.')
    })

    // wrap final handler
    fns = _wrapFinalHandler(fns)

    for (let method of methods) {
      if (this._handlers.has(method)) {
        throw new Error(`Method '${method}' already defined for "${this.path}"`)
      }

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
 * @param {Array<Middleware>} handlers
 * @returns {Array<Middleware>}
 * @private
 */
function _wrapFinalHandler (handlers: Middleware[]) {
  let fn = handlers.pop() as any

  handlers.push(_wrap(fn))

  return handlers
}

/**
 * Wrap the route handler
 * 
 * @param {RouteHandler} fn
 * @returns {Middleware}
 * @private
 */
function _wrap (fn: RouteHandler): Middleware {
  // return async (ctx, next) => {
  //   try {
  //     var body = await fn(ctx)

  //     if (body && !ctx.response.body) {
  //       ctx.response.body = body
  //     }

  //     next()
  //   } catch (error) {
  //     next(error)
  //   }
  // }
  return (ctx, next) => {
    new Promise((r) => r(fn(ctx))).then((body?: any) => {
      if (body && !ctx.response.body) {
        ctx.response.body = body
      }

      next()
    }).catch(next)
  }
}
