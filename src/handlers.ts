
import { setImmediate } from 'timers'
import { Context, Handler } from './types'

/**
 * Compose multiple handlers into a single handler
 * 
 * @param fns
 */
export function compose (fns: Handler[]): (ctx: Context) => Promise<any> {
  // TODO ensure `fns` are functions
  return (ctx) => _dispatch(ctx, fns)
}

/**
 * Invoke the context handlers one by one
 * 
 * @param ctx
 * @param fns
 * @private
 */
function _dispatch (ctx: Context, fns: Handler[]): Promise<any> {
  return new Promise((resolve, reject) => {
    var i = 0

    next()

    function next (err?: any, stop = false): void {
      if (err != null) return reject(err)

      var fn = fns[i++]

      if (stop || !fn) return resolve()

      setImmediate(_try, fn, ctx, next)
    }
  })
}

/**
 * Try the current handler then call the next one
 * 
 * @param fn
 * @param ctx
 * @param next
 * @private
 */
async function _try (fn: Handler, ctx: Context, next: NextFn) {
  try {
    var call: any = await fn(ctx)

    next(null, call === false)
  }
  catch (error) {
    next(error)
  }
}

type NextFn = (err?: any, stop?: boolean) => void
