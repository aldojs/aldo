
import { isString } from './util'
import * as mime from 'mime-types'
import { IncomingHttpHeaders } from 'http'

type Accept = { value: string, weight: number }

const PARSE_RE = /^\s*([^\s;]+)\s*(?:;(.*))?$/

/**
 * 
 * @param req
 * @param preferences
 */
export function accept (req: { headers: IncomingHttpHeaders }, preferences: string[]): string | false | string[] {
  var mediaTypes = _parse(req, 'accept', ['*/*'])

  // no types, return the first preferred type
  if (!preferences.length) return mediaTypes

  var mimes: any = preferences.reduce(_mimeReducer, {})

  for (let accept of mediaTypes)
    for (let type in mimes)
      if (_matchType(accept, type))
        return mimes[type]

  return false
}

/**
 * 
 * @param req
 * @param preferences
 */
export function acceptCharset (req: { headers: IncomingHttpHeaders }, preferences: string[]): string | false | string[] {
  return _match(_parse(req, 'accept-charset'), preferences)
}

/**
 * 
 * @param req
 * @param preferences
 */
export function acceptEncoding (req: { headers: IncomingHttpHeaders }, preferences: string[]): string | false | string[] {
  var encodings = _parse(req, 'accept-encoding', ['identity'])

  // https://tools.ietf.org/html/rfc7231#section-5.3.4
  if (!encodings.includes('identity')) encodings.push('identity')

  return _match(encodings, preferences)
}

/**
 * 
 * @param req
 * @param preferences
 */
export function acceptLanguage (req: { headers: IncomingHttpHeaders }, preferences: string[]): string | false | string[] {
  return _match(_parse(req, 'accept-language'), preferences)
}

/**
 * 
 * @param memo
 * @param value
 * @private
 */
function _mimeReducer (memo: { [x: string]: string }, value: string) {
  memo[_normalize(value)] = value
  return memo
}

/**
 * Normalize the mime type
 * 
 * @param type
 * @private
 */
function _normalize (type: string): string {
  return type.includes('/') ? type : (mime.lookup(type) || '')
}

/**
 * 
 * @param req
 * @param header
 * @param defaultValue
 * @private
 */
function _parse ({ headers }: { headers: IncomingHttpHeaders }, header: string, defaultValue = ['*']): string[] {
  let value = headers[header]

  if (isString(value)) {
    value = headers[header] = _parseAccept(value)
  }

  return value || (headers[header] = defaultValue)
}

/**
 * 
 * @param memo
 * @param value
 * @private
 */
function _removeDuplicate (memo: string[], value: string): string[] {
  if (!memo.includes(value)) memo.push(value)
  
  return memo
}

/**
 * 
 * @param accepted
 * @param preferences
 * @private
 */
function _match (accepted: string[], preferences: string[]): string | false | string[] {
  // no preferences, return all accepted
  if (!preferences.length) return accepted

  for (let accept of accepted)
    for (let value of preferences)
      if (_matchAccept(accept, value))
        return value

  return false
}

/**
 * 
 * @param accepted
 * @param type
 * @private
 */
function _matchType (accepted: string, type: string): boolean {
  type = type.toLowerCase()
  accepted = accepted.toLowerCase()

  if (accepted === type) return true

  for (let i = 0; i < Math.min(accepted.length, type.length); i++) {
    if (accepted[i] === '*') return true

    if (accepted[i] !== type[i]) break
  }

  return false
}

/**
 * Parse `Accept-*` header
 * 
 * @param header
 * @private
 */
function _parseAccept (header: string): string[] {
  return header
    .split(',')
    .map(_parsePart)
    .filter(_acceptable)
    .sort(_byWeight)
    .map(_toString)
    .reduce(_removeDuplicate, [])
}

/**
 * 
 * @param obj
 * @private
 */
function _toString (obj: Accept): string {
  return obj.value
}

/**
 * 
 * @param a
 * @param b
 * @private
 */
function _byWeight (a: Accept, b: Accept): number {
  return b.weight - a.weight
}

/**
 * 
 * @param obj
 * @private
 */
function _acceptable (obj: Accept): boolean {
  return obj.weight > 0
}

/**
 * Parse accept part
 * 
 * @param part
 * @private
 */
function _parsePart (part: string): Accept {
  var match = PARSE_RE.exec(part.toLowerCase())

  if (!match) return { value: '', weight: 0 }

  if (match[2]) {
    let params = match[2].split(';')

    for (let i = 0; i < params.length; i++) {
      let [key, val] = params[i].trim().split('=')

      // look for quality param
      if (key === 'q') {
        return {
          value: match[1],
          weight: parseFloat(val)
        }
      }
    }
  }

  return { value: match[1], weight: 1 }
}

/**
 * 
 * @param accept
 * @param preference
 * @private
 */
function _matchAccept (accept: string, preference: string): boolean {
  return accept === '*' || accept.toLowerCase() === preference.toLowerCase()
}
