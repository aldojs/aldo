
import * as cookie from 'cookie'

const SYMBOL = '__cookie'

export type ParseOptions = cookie.CookieParseOptions
export type SerializeOptions = cookie.CookieSerializeOptions

/**
 * Parse the `Cookie` header
 * 
 * @param req
 * @param options
 */
export function parse (req: any, options?: ParseOptions): { [x: string]: string | undefined } {
  if (req[SYMBOL] === undefined) {
    let header = req.headers['cookie']

    req[SYMBOL] = header ? cookie.parse(header, options) : {}
  }

  return req[SYMBOL]
}

/**
 * Serialize the cookie name
 * 
 * @param name
 * @param value
 * @param options
 */
export function serialize (name: string, value: string, options?: SerializeOptions): string {
  return cookie.serialize(name, String(value), options)
}
