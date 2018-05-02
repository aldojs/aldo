
import * as assert from 'assert'
import * as ct from './support/content-type'
import * as cl from './support/content-length'
import * as statuses from './support/status-code'
import { OutgoingHttpHeaders, ServerResponse } from 'http'
import { isStream, isString, isWritable, isObject } from './support/util'

export default class Response {
  /**
   * The response status code
   */
  public statusCode: number = 204

  /**
   * The response status message
   */
  public statusMessage: string = 'No Content'

  /**
   * The response body
   */
  private _body: any = null

  /**
   * The response headers
   */
  private _headers: OutgoingHttpHeaders = {}

  /**
   * Initialize a new response builder
   * 
   * @param body
   */
  constructor (body?: any) {
    if (body != null) this.body = body
  }

  /**
   * Create a response instance from the given content
   * 
   * @param content The response body
   */
  public static from (content?: any): Response {
    if (content instanceof Response) return content

    if (content instanceof Error) return _fromError(content)

    return new Response(content)
  }

  /**
   * Response headers
   * 
   * Shortcut to `this.stream.getHeaders()`
   */
  public get headers (): OutgoingHttpHeaders {
    return this._headers
  }

  /**
   * Get the response body
   */
  public get body (): any {
    return this._body
  }

  /**
   * Set the response body
   */
  public set body (value: any) {
    // empty body
    if (value == null) {
      if (!statuses.isEmpty(this.statusCode)) {
        this.statusMessage = 'No Content'
        this.statusCode = 204
      }

      this._clearBody()
      return
    }

    this._body = value

    // status code
    this.statusCode = 200
    this.statusMessage = 'OK'

    // content type
    if (!this.has('Content-Type')) {
      this.set('Content-Type', ct.from(value))
    }
  }

  /**
   * Set the response status code
   */
  public status (code: number): this {
    assert('number' === typeof code, 'The status code must be a number')
    assert(code >= 100 && code <= 999, 'Invalid status code')

    if (this.body && statuses.isEmpty(code)) this._clearBody()

    this.statusMessage = statuses.messageOf(code)
    this.statusCode = code

    return this
  }

  /**
   * Set `Content-Type` response header.
   * 
   * Will add the the charset if not present.
   * 
   * Examples:
   * 
   *     response.type('application/json')
   *     response.type('.html')
   *     response.type('html')
   *     response.type('json')
   *     response.type('png')
   */
  public type (value: string): this {
    let type = ct.normalize(value)

    if (!type) return this
    
    return this.set('Content-Type', type)
  }

  /**
   * Set `Content-Length` reponse header
   */
  public length (value: number): this {
    return this.set('Content-Length', value)
  }

  /**
   * Set the `Last-Modified` response header
   */
  public lastModified (value: string | Date): this {
    if (isString(value)) value = new Date(value)

    return this.set('Last-Modified', value.toUTCString())
  }

  /**
   * Set the `ETag` of the response.
   * 
   * This will normalize the quotes if necessary.
   * 
   * Examples:
   * 
   *     response.etag('md5hashsum')
   *     response.etag('"md5hashsum"')
   *     response.etag('W/"123456789"')
   */
  public etag (value: string): this {
    if (!/^(W\/)?"/.test(value)) value = `"${value}"`

    return this.set('ETag', value)
  }

  /**
   * Set the `Location` response header
   */
  public location (url: string): this {
    return this.set('Location', encodeURI(url))
  }

  /**
   * Append `field` to the `Vary` header
   */
  public vary (...headers: string[]): this {
    // match all
    if (headers.includes('*')) {
      return this.set('Vary', '*')
    }

    // first time
    if (!this.has('Vary')) {
      return this.set('Vary', String(headers))
    }

    let value = this.get('Vary') as string || ''

    // existing
    if (value !== '*') {
      for (let name of headers) {
        if (!value.includes(name)) value += `, ${name}`
      }

      this.set('Vary', value)
    }

    return this
  }

  /**
   * Check if the incoming request contains the "Content-Type"
   * header field, and it contains any of the give mime `type`s.
   * 
   * It returns the first matching type or false otherwise.
   * 
   * Pretty much the same as `Request.is()`
   * 
   * @param types
   */
  public is (...types: string[]): string | false {
    return ct.is(this.get('Content-Type') as string, types)
  }

  /**
   * Get the response header if present, or undefined
   * 
   * @param header
   */
  public get (header: string): string | number | string[] | undefined {
    return this.headers[header.toLowerCase()]
  }

  /**
   * Set the response header, or pass an object of header fields.
   * 
   * Examples:
   * 
   *    response.set({ Accept: 'text/plain', 'X-API-Key': 'tobi' })
   * 
   * @param headers
   */
  public set (headers: { [field: string]: string | number | string[] }): this

  /**
   * Set the response header, or pass an object of header fields.
   * 
   * Examples:
   * 
   *    response.set('Foo', ['bar', 'baz'])
   *    response.set('Accept', 'application/json')
   * 
   * @param header
   * @param value
   */
  public set (header: string, value: string | number | string[]): this
  public set (header: any, value?: any) {
    if (isObject(header)) {
      for (let name in header)
        this.set(name, header[name])
    }
    else {
      this.headers[header.toLowerCase()] = value
    }

    return this
  }

  /**
   * Append additional header name
   * 
   * Examples:
   * 
   *    this.append('Link', ['<http://localhost/>', '<http://localhost:3000/>'])
   *    this.append('Set-Cookie', 'foo=bar; Path=/; HttpOnly')
   *    this.append('Warning', '199 Miscellaneous warning')
   * 
   * @param header
   * @param value
   */
  public append (header: string, value: string | string[]): this {
    if (this.has(header)) {
      let oldValue = this.get(header)

      if (!Array.isArray(oldValue)) {
        oldValue = [String(oldValue)]
      }

      value = oldValue.concat(value)
    }

    this.set(header, value)

    return this
  }

  /**
   * Check if response header is defined
   * 
   * @param header
   */
  public has (header: string): boolean {
    return this.get(header) !== undefined
  }

  /**
   * Remove the response header
   * 
   * @param header
   */
  public remove (header: string): this {
    delete this.headers[header.toLowerCase()]
    return this
  }

  /**
   * Reset all response headers
   * 
   * @param headers
   */
  public reset (headers?: { [field: string]: string | number | string[] }): this {
    this._headers = {}

    if (headers) this.set(headers)

    return this
  }

  /**
   * Send and end the response stream
   * 
   * @param res
   */
  public end (res: ServerResponse): void {
    // socket not writable
    if (!isWritable(res)) return

    let { body: content, statusCode, statusMessage } = this

    if (!res.headersSent) {
      // res.writeHead(statusCode, statusMessage, this.headers) is slow

      res.statusCode = statusCode
      res.statusMessage = statusMessage

      for (let field in this.headers) {
        res.setHeader(field, this.headers[field] as any)
      }
    }

    // ignore body
    if (statuses.isEmpty(statusCode)) return res.end()

    // stream
    if (isStream(content)) {
      content.pipe(res)
      return
    }

    // status body
    if (content == null) {
      content = statusMessage || String(statusCode)
      res.setHeader('Content-Type', 'text/plain; charset=utf-8')
    }

    // json
    if (! (isString(content) || Buffer.isBuffer(content))) {
      content = JSON.stringify(content)
    }

    // terminate
    res.end(content)
  }

  /**
   * Clear the response body and remove the content headers
   */
  private _clearBody (): void {
    this.remove('Transfer-Encoding')
    this.remove('Content-Length')
    this.remove('Content-type')
    this._body = null
  }
}

/**
 * Create a response instance from the given error object
 * 
 * @param obj The error object
 * @private
 */
function _fromError (obj: { expose?: boolean, message: string, statusCode?: number, headers?: { [key: string]: any } }): Response {
  let body = obj.expose ? obj.message : 'Internal Server Error'

  return new Response(body).status(obj.statusCode || 500).set(obj.headers || {})
}
