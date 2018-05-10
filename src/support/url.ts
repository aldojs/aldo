
import { Url } from 'url'
import * as parseUrl from 'parseurl'
import { IncomingMessage } from 'http'

/**
 * Parse the incoming message url
 * 
 * @param req
 */
export function parse (req: { url: string }): Url {
  return parseUrl(req as any) || {}
}
