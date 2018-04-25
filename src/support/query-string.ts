
import * as url from './url'
import * as qs from 'querystring'
import { isObject } from './util'
import { IncomingMessage } from 'http'

/**
 * Parse the request query string
 * 
 * @param req
 */
export function parse (req: IncomingMessage): { [x: string]: any } {
  let parsed = url.parse(req)

  if (!isObject(parsed.query)) {
    let str = parsed.search ? parsed.search.slice(1) : ''

    parsed.query = str ? qs.parse(str) : {}
  }

  return parsed.query as object
}
