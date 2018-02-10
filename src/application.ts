
import * as assert from 'assert'
import { setImmediate } from 'timers'
import * as TreeRouter from 'find-my-way'
import * as ContextFactory from './context'
import { Request, Response } from 'aldo-http'
import { Route, Middleware, Factory, Context, Container, RouteHandler, Router, Dispatcher } from './types'

export default class Application implements Container, Dispatcher {
  private _factories = new Map<string | symbol, Factory>()
  private _namedRoutes = new Map<string, Route>()
  private _errorMiddlewares: Middleware[] = []
  private _postMiddlewares: Middleware[] = []
  private _preMiddlewares: Middleware[] = []
  private _finally: RouteHandler = _respond
  private _tree = new TreeRouter()

  /**
   * 
   * 
   * @param {Function} fn
   * @returns {Application}
   */
  pre (fn: Middleware) {
    _assertFunction(fn)
    this._preMiddlewares.push(fn)
    return this
  }

  /**
   * 
   * 
   * @param {Function} fn
   * @returns {Application}
   */
  post (fn: Middleware) {
    _assertFunction(fn)
    this._postMiddlewares.push(fn)
    return this
  }

  /**
   * 
   * 
   * @param {Function} fn
   * @returns {Application}
   */
  catch (fn: Middleware) {
    _assertFunction(fn)
    this._errorMiddlewares.push(fn)
    return this
  }

  /**
   * 
   * 
   * @param {Function} fn
   * @returns {Application}
   */
  finally (fn: RouteHandler) {
    _assertFunction(fn, 'The final handler should be a function')
    this._finally = fn
    return this
  }

  /**
   * 
   * 
   * @param {Router} router
   * @returns {Application}
   */
  use (router: Router) {
    for (let route of router.routes()) {
      for (let [method, fns] of route.handlers()) {
        this._tree.on(method, route.path, this._compose(fns))
      }

      // register named route
      if (route.name) this._namedRoutes.set(route.name, route)
    }

    return this
  }

  /**
   * 
   * 
   * @param {String | Symbol} key
   * @param {Any...} [args]
   * @returns {Object}
   */
  get (key: string | symbol, ...args: any[]): any {
    let fn = this._factories.get(key)

    // debug('get %s value', name)

    if (fn) {
      switch (fn.length) {
        case 6: return fn(this, args[0], args[1], args[2], args[3], args[4])
        case 5: return fn(this, args[0], args[1], args[2], args[3])
        case 4: return fn(this, args[0], args[1], args[2])
        case 3: return fn(this, args[0], args[1])
        case 2: return fn(this, args[0])
        case 1: return fn(this)
        case 0: return fn()
      }
    }

    throw new Error(`Identifier "${key}" is not defined.`)
  }

  /**
   * 
   * 
   * @param {String | Symbol} key
   * @returns {Boolean}
   */
  has (key: string | symbol): boolean {
    return this._factories.has(key)
  }

  /**
   * 
   * 
   * @param {String | Symbol} key
   * @param {Object | Function} fn
   * @returns {Application}
   */
  set (key: string | symbol, fn: object | Factory) {
    // TODO warn instead
    assert(this.has(key), `Identifier "${key}" already defined.`)

    // object
    if (typeof fn !== 'function') {
      let obj = fn

      fn = () => obj
    }

    // debug(`set a factory for ${name}`)
    this._factories.set(key, fn as Factory)
    return this
  }

  /**
   * 
   * 
   * @param {String | Symbol} key
   * @param {Function} fn
   * @returns {Application}
   */
  singleton (key: string | symbol, fn: Factory) {
    _assertFunction(fn, 'Factory should be a function')
    return this.set(key, _memoize(fn))
  }

  /**
   * Get the HTTP request listener
   * 
   * @returns {Function}
   */
  callback () {
    return (req: Request, res: Response) => {
      this.dispatch(ContextFactory.create(this, req, res))
    }
  }

  /**
   * Dispatch routes
   */
  dispatch (ctx: Context): void {
    let { method, url } = ctx.request
    let found = this._tree.find(method, url)

    // debug(`dispatch: ${method} ${url}`);

    // 404
    if (!found) {
      let err = _notFoundError(url)

      this._loopCatchers(err, ctx)
      return
    }

    // add url params to the context
    ctx.params = found.params || {}

    // invoke the route handler
    found.handler(ctx)
  }

  /**
   * 
   * 
   * @param {Array<Function>} fns
   * @returns {Function}
   * @private
   */
  private _compose (fns: Middleware[]): RouteHandler {
    let handlers = [...this._preMiddlewares, ...fns, ...this._postMiddlewares]

    return (ctx: Context) => this._loopHandlers(ctx, handlers)
  }

  /**
   * 
   * 
   * @param {Object} ctx
   * @param {Array<Function>} fns
   * @private
   */
  private _loopHandlers (ctx: Context, fns: Middleware[]) {
    let i = 0

    let next = (err?: any) => {
      if (err) {
        this._loopCatchers(err, ctx)
        return
      }

      let fn = fns[i++]

      if (!fn) {
        next = _noop
        fn = this._finally
      }

      // async call
      setImmediate(fn, ctx, next)
    }

    next()
  }

  /**
   * 
   * 
   * @param {Error} err
   * @param {Object} ctx
   * @private
   */
  private _loopCatchers (err: any, ctx: Context) {
    let i = 0

    // set the context error
    ctx.error = err

    let next = () => {
      let fn = this._errorMiddlewares[i++]

      if (!fn) {
        next = _noop
        fn = this._finally
      }

      // async call
      setImmediate(fn, ctx, next)
    }

    next()
  }
}

/**
 * Memoize the factory result
 * 
 * @param {Factory} fn
 * @returns {Factory}
 * @private
 */
function _memoize (fn: Factory): Factory {
  let value: any

  return (c: Container, ...args: any[]) => {
    return value || (value = fn(c, ...args))
  }
}

/**
 * Create a 404 error instance
 * 
 * @param {String} path
 * @returns {Error}
 * @private
 */
function _notFoundError (path: string) {
  let msg = `Route not found for "${path}".`
  let error: any = new Error(msg)

  error.code = 'NOT_FOUND'
  error.expose = true
  error.status = 404

  return error
}

/**
 * Ensure the given argument is a middleware function
 * 
 * @param {Any} arg
 * @private
 */
function _assertFunction (arg: any, msg?: string) {
  assert(typeof arg === 'function', msg || 'The middleware should be a function')
}

/**
 * Send the response
 * 
 * @private
 */
function _respond ({ response }: Context) {
  response.send()
}

/**
 * Noop
 * 
 * @private
 */
function _noop () {
  // do nothing
}
