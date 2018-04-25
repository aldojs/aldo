
import * as cookie from 'cookie'
import { isObject } from './util'
import { IncomingMessage } from 'http'

export type ParseOptions = cookie.CookieParseOptions
export type SerializeOptions = cookie.CookieSerializeOptions

/**
 * Parse the `Cookie` header
 * 
 * @param req
 * @param options
 */
export function parse ({ headers }: IncomingMessage, options?: ParseOptions): { [x: string]: string | undefined } {
  let cookies = headers['cookie'] as any

  if (!isObject(headers['cookie'])) {
    headers['cookie'] = cookies ? cookie.parse(cookies, options) : {} as any
  }

  return headers['cookie'] as any
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
