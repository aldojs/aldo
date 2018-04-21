
import { Url } from 'url'
import * as parseUrl from 'parseurl'
import { IncomingMessage } from 'http'

/**
 * 
 * @param req
 */
export function parse (req: IncomingMessage): Url {
  return parseUrl(req) || {}
}
