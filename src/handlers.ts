
import { format } from 'util'
import { setImmediate } from 'timers'
import { Context, Handler } from './types'

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
      if (finish) return resolve(false)

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

      setImmediate(_tryHandler, fn, ctx, next)
    }
  })
}

/**
 * Compose multiple handlers into a single one
 * 
 * @param fns
 */
export function compose (fns: Handler[]): (ctx: Context) => Promise<any> {
  return (ctx) => dispatch(ctx, fns)
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
