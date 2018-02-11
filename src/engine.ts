
import { setImmediate } from 'timers'
import { Middleware, ErrorMiddleware, FinalHandler, Context } from './types'

export default class Engine {
  private _catchers: Middleware[] = []
  private _finally: FinalHandler

  /**
   * Initialize a new middleware engine
   * 
   * @param {Function} fn
   */
  constructor (fn: FinalHandler) {
    this._finally = _ensureFunction(fn)
  }

  /**
   * 
   * 
   * @param {Object} ctx
   * @param {Array<Function>} fns
   */
  try (ctx: Context, fns: Middleware[]) {
    var i = 0

    var next = (err?: any) => {
      if (!ctx.error && err) {
        this.catch(err, ctx)
        return
      }

      var fn = fns[i++]

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
   */
  catch (err: any, ctx: Context) {
    // TODO ensure the err in an Error instance

    // set the context error
    ctx.error = err

    this.try(ctx, this._catchers)
  }

  /**
   * 
   * 
   * @param {Function} fn
   */
  onError (fn: ErrorMiddleware) {
    this._catchers.push(_ensureFunction(fn))
  }

  /**
   * 
   * 
   * @param {Function} fn
   */
  onEnd (fn: FinalHandler) {
    this._finally = _ensureFunction(fn)
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

  throw new TypeError(`Function expected but ${typeof arg} given.`)
}

/**
 * Noop
 * 
 * @private
 */
function _noop () {
  // do nothing
}
