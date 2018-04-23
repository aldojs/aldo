
import { isStream, isString } from './util'

/**
 * Calculate the content length
 * 
 * @param content
 */
export function from (content: any): number {
  if (content) {
    if (isString(content) || Buffer.isBuffer(content)) {
      return Buffer.byteLength(content)
    }

    // json
    if (!isStream(content)) {
      return Buffer.byteLength(JSON.stringify(content))
    }
  }
  
  return NaN
}
