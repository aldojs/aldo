
import { format } from 'util'
import { Context, Handler } from './types'
import { setImmediate as defer } from 'timers'

/**
 * Invoke the context handlers one by one
 * 
 * @param ctx
 * @param fns
 */
export function dispatch (ctx: Context, fns: Handler[]): Promise<any> {
  return new Promise<any>((resolve, reject) => {
    var i = 0

    next()

    function next (err?: any, finish = false): void {
      if (finish) return resolve(true)

      if (err != null) {
        // ensure `err` is an instance of `Error`
        if (!(err instanceof Error)) {
          err = new TypeError(format('non-error thrown: %j', err))
        }

        if (ctx.error == null) return reject(err)

        ctx.error = err
      }

      var fn = fns[i++]

      if (!fn) return resolve()

      defer(_tryHandler, fn, ctx, next)
    }
  })
}

/**
 * Compose multiple handlers into a single one
 * 
 * @param fns
 */
export function compose (fns: Handler[]): Handler {
  return fns.length === 1 ? fns[0] : (ctx) => dispatch(ctx, fns)
}
 
/**
 * Try the current handler then call the next one
 * 
 * @param fn
 * @param ctx
 * @param next
 * @private
 */
async function _tryHandler (fn: Handler, ctx: Context, next: (err?: any, finish?: boolean) => void) {
  try {
    var callNext: any = await fn(ctx)

    callNext === false ? next(null, true) : next()
  }
  catch (error) {
    next(error)
  }
}
