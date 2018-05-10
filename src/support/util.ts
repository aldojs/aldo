
import { Stream } from 'stream'
import { ServerResponse } from 'http'
import { Http2ServerResponse } from 'http2'

/**
 * Check if the argument is a string
 * 
 * @param obj
 */
export function isString (obj: any): obj is string {
  return typeof obj === 'string'
}

/**
 * Check if the argument is an object
 * 
 * @param obj
 */
export function isObject (obj: any): obj is { [x: string]: any } {
  return obj && typeof obj === 'object'
}

/**
 * Check if the argument is a stream instance
 * 
 * @param obj
 */
export function isStream (obj: any): obj is Stream {
  return isObject(obj) && typeof obj.pipe === 'function'
}
