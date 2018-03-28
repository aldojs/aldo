
import { join } from 'path'
import * as assert from 'assert'
import { Handler } from './types'
import * as createDebugger from 'debug'

const debug = createDebugger('aldo:route')
const METHODS = ['HEAD', 'GET', 'PATCH', 'POST', 'PUT', 'DELETE', 'OPTIONS']

/**
 * Route container
 */
export default class Route {
  private _handlers = new Map<string, Handler[]>()
  private _prefix: string
  private _name: string
  private _path: string

  /**
   * Initialize a new route instance
   * 
   * @param path
   * @param prefix
   */
  public constructor (path: string, prefix: string = '') {
    this._prefix = _normalize(prefix)
    this._path = _normalize(path)
    this._name = ''
  }

  /**
   * The route path
   */
  public get path (): string {
    return join(this._prefix, this._path)
  }

  /**
   * The route name
   */
  public get name (): string {
    return this._name
  }

  /**
   * Set the route name
   * 
   * @param {String} name
   */
  public as (name: string): this {
    this._name = name
    debug(`set route name to "${this._name}"`)
    return this
  }

  /**
   * Set the route prefix
   * 
   * @param path
   * 
   * @todo add test case for "/" path
   */
  public prefix (path: string) {
    this._prefix = _normalize(path)
    debug(`set route prefix to "${this._prefix}"`)
    return this
  }

  /**
   * Get an iterator of the route handlers
   */
  public handlers (): [string, Handler[]][] {
    return Array.from(this._handlers)
  }

  /**
   * Set handlers for HEAD method
   * 
   * @param fns
   */
  public head (...fns: Handler[]): this {
    return this.any(['HEAD'], ...fns)
  }

  /**
   * Set handlers for HEAD and GET methods
   * 
   * @param fns
   */
  public get (...fns: Handler[]): this {
    return this.any(['HEAD', 'GET'], ...fns)
  }

  /**
   * Set handlers for POST method
   * 
   * @param fns
   */
  public post (...fns: Handler[]): this {
    return this.any(['POST'], ...fns)
  }

  /**
   * Set handlers for PUT method
   * 
   * @param  fns
   */
  public put (...fns: Handler[]): this {
    return this.any(['PUT'], ...fns)
  }

  /**
   * Set handlers for PATCH method
   * 
   * @param fns
   */
  public patch (...fns: Handler[]): this {
    return this.any(['PATCH'], ...fns)
  }

  /**
   * Set handlers for DELETE method
   * 
   * @param fns
   */
  public delete (...fns: Handler[]): this {
    return this.any(['DELETE'], ...fns)
  }

  /**
   * Set handlers for OPTIONS method
   * 
   * @param fns
   */
  public options (...fns: Handler[]): this {
    return this.any(['OPTIONS'], ...fns)
  }

  /**
   * Set handlers for the all accepted HTTP methods
   * 
   * Only 'HEAD', 'GET', 'PATCH', 'POST', 'PUT', 'DELETE', 'OPTIONS' are available
   * 
   * @param fns
   */
  public all (...fns: Handler[]): this {
    return this.any(METHODS, ...fns)
  }

  /**
   * Set handlers for the given HTTP methods
   * 
   * Only 'HEAD', 'GET', 'PATCH', 'POST', 'PUT', 'DELETE', 'OPTIONS' are accepted
   * 
   * @param methods
   * @param fns
   */
  public any (methods: string[], ...fns: Handler[]): this {
    assert(fns.length, 'At least one route handler is required.')

    for (let fn of fns) {
      assert(typeof fn === 'function', 'Route handler must be a function.')
    }

    for (let method of methods) {
      assert(!this._handlers.has(method), `Method '${method}' already defined for "${this.path}"`)
      assert(METHODS.includes(method.toUpperCase()), `Method '${method}' not accepted.`)

      debug(`add handlers for ${method.toUpperCase()} ${this.path}`)
      this._handlers.set(method, fns)
    }

    return this
  }
}

/**
 * Normalize the URL path
 * 
 * @param path
 * @private
 */
function _normalize (path: string): string {
  if (path.endsWith('/')) path = path.slice(0, -1)

  if (!path.startsWith('/')) path = '/' + path

  return path
}
