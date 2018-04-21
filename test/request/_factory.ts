
import Request from '../../src/request'

/**
 * 
 * @param req
 * @param options
 * @public
 */
export function createRequest (req: any = {}, options = {}) {
  return new Request(_parse(req), options)
}

/**
 * 
 * @param req
 * @private
 */
function _parse (req: any) {
  return Object.assign({ headers: {}, socket: {} }, req)
}
