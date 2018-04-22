
import * as statuses from 'statuses'

/**
 * 
 * @param code
 */
export function messageOf (code: number): string {
  return statuses[code] || ''
}

/**
 * 
 * @param code
 */
export function isEmpty (code: number): boolean {
  return !!statuses.empty[code]
}
