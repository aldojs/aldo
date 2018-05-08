
import { IncomingHttpHeaders } from 'http'

const SEPARATOR_RE = /\s*,\s*/

/**
 * Parse `X-Forwarded-*` headers
 * 
 * @param req
 * @param field
 */
export function parse ({ headers }: { headers: IncomingHttpHeaders }, field: string): string[] {
  var value = headers[field] || ''

  // parse
  if (typeof value === 'string') {
    value = headers[field] = value.split(SEPARATOR_RE)
  }

  return Array.isArray(value) ? value : []
}
