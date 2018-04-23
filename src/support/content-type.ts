
import * as mime from 'mime-types'
import { is as typeis } from 'type-is'
import { isString, isStream } from './util'

const HTML_RE = /^\s*</

/**
 * 
 * @param header
 */
export function extract (header: string): string | undefined {
  if (header) return header.split(';', 1)[0].trim()
}

/**
 * 
 * @param header
 * @param types
 */
export function is (header: string, types: string[]): string | false {
  return header ? typeis(header, types) : false
}

/**
 * 
 * 
 * @param type
 */
export function normalize (type: string): string | false {
  return mime.contentType(type)
}

/**
 * Guess the content type, default to `application/json`
 * 
 * @param content
 */
export function from (content: any): string {
  // string
  if (isString(content)) {
    return `text/${HTML_RE.test(content) ? 'html' : 'plain'}; charset=utf-8`
  }

  // buffer or stream
  if (Buffer.isBuffer(content) || isStream(content)) {
    return 'application/octet-stream'
  }

  // json
  return 'application/json'
}
