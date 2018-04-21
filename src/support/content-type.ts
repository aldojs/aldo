
import { is as typeis } from 'type-is'

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
