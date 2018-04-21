
import * as url from './url'
import * as qs from 'querystring'

const SYMBOL = '__query'

/**
 * 
 * @param req
 */
export function parse (req: any): { [x: string]: any } {
  // parse
  if (req[SYMBOL] === undefined) {
    let str = url.parse(req).query as string || ''

    req[SYMBOL] = (str ? qs.parse(str) : {})
  }

  return req[SYMBOL]
}
