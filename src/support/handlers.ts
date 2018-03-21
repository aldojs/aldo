
import * as FindMyWay from 'find-my-way'
import { Context, Handler } from '../types'

export default function (notFoundHandler: Handler) {
  var fmw = new FindMyWay()

  /**
   * Add a handler for the given end point
   * 
   * @param method
   * @param path
   * @param handler
   */
  function add (method: string | string[], path: string, fn: Handler) {
    fmw.on(method, path, fn)
  }

  /**
   * Invoke the matched context handler
   * 
   * @param ctx
   */
  function invoke (ctx: Context) {
    var { method, url } = ctx.request
    var found = fmw.find(method, url)

    if (!found) notFoundHandler(ctx)
    else {
      // add url params to the context
      ctx.params = found.params || {}

      // invoke the route handler
      found.handler(ctx)
    }
  }

  // export
  return { add, invoke }
}
