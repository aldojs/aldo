
import { setImmediate } from 'timers'
import { Context, Handler } from '../types'

/**
 * Dispatcher factory
 * 
 * @param errorHandlers
 */
export default function (errorHandlers: Handler[] = []) {
  /**
   * Compile the 
   * 
   * @param fns
   * @param done
   */
  function compile (fns: Handler[], done: Handler) {
    return (ctx: Context) => dispatch(ctx, fns, done)
  }

  /**
   * Dispatch the context to the handlers
   * 
   * @param ctx
   * @param fns
   * @param done
   */
  function dispatch (ctx: Context, fns: Handler[], done: Handler) {
    var i = 0

    next()

    /**
     * Calls asynchronously the next handler
     * 
     * @param err
     */
    function next (err?: any) {
      if (err != null) {
        // TODO ensure `err` is an Error instance

        if (ctx.error == null) {
          fns = errorHandlers
          i = 0 // rewind
        }

        ctx.error = err
      }

      var fn = fns[i++]

      if (!fn) setImmediate(done || _noop, ctx)
      else setImmediate(_tryHandler, fn, ctx, next)
    }
  }

  // export
  return { compile, dispatch }
}

/**
 * Try the current handler then call the next one
 * 
 * @param fn
 * @param ctx
 * @param next
 * @private
 */
async function _tryHandler (fn: Handler, ctx: Context, next: (err?: any) => void) {
  try {
    await fn(ctx)
    next()
  }
  catch (error) {
    next(error)
  }
}

/**
 * @private
 */
function _noop () {
  // do nothing
}
