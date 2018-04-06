
import { setImmediate } from 'timers'

/**
 * Compose multiple handlers into a single handler
 * 
 * @param fns
 */
export function compose (fns: Function[]): (...args: any[]) => Promise<void> {
  // TODO ensure `fns` are functions
  return (...args: any[]) => _dispatch(args, fns)
}

/**
 * Invoke the handlers one by one
 * 
 * @param args
 * @param fns
 * @private
 */
function _dispatch (args: any[], fns: Function[]): Promise<void> {
  return new Promise((resolve, reject) => {
    var i = 0

    next()

    function next (err?: any, stop = false): void {
      if (err != null) return reject(err)

      var fn = fns[i++]

      if (stop || !fn) return resolve()

      setImmediate(_try, fn, args, next)
    }
  })
}

/**
 * Try the current handler then call the next one
 * 
 * @param fn
 * @param args
 * @param next
 * @private
 */
async function _try (fn: Function, args: any[], next: (err?: any, stop?: boolean) => void) {
  try {
    var call: any = await fn(...args)

    next(null, call === false)
  }
  catch (error) {
    next(error)
  }
}
