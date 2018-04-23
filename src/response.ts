
import * as assert from 'assert'
import * as cookie from './support/cookie'
import * as ct from './support/content-type'
import * as cl from './support/content-length'
import * as statuses from './support/status-code'
import { OutgoingHttpHeaders, ServerResponse } from 'http'
import { isStream, isString, isWritable, isObject } from './support/util'

export default class Response {
  /**
   * The response body
   */
  private _body: any = null

  /**
   * The response status code
   */
  private _status: number = 204

  /**
   * The response status message
   */
  private _message: string = 'No Content'

  /**
   * The response headers
   */
  private _headers: OutgoingHttpHeaders = Object.create(null)

  /**
   * Create a response instance from the given content
   * 
   * @param content
   */
  public static from (content?: any): Response {
    if (content instanceof Response) return content

    let resp = new Response()

    if (content != null) resp.body = content

    return resp
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
   * Set the response status code
   */
  public set status (code: number) {
    assert('number' === typeof code, 'The status code must be a number')
    assert(code >= 100 && code <= 999, 'Invalid status code')

    this._status = code
    this._message = statuses.messageOf(code)

    if (this.body && statuses.isEmpty(code)) this._clearBody()
  }

  /**
   * Get the response status code
   */
  public get status (): number {
    return this._status
  }

  /**
   * Set the response status message
   */
  public set message (value: string) {
    this._message = value
  }

  /**
   * Get the response status message
   */
  public get message (): string {
    return this._message
  }

  /**
   * Set `Content-Type` response header.
   * 
   * Will add the the charset if not present.
   * 
   * Examples:
   * 
   *     response.type = 'application/json'
   *     response.type = '.html'
   *     response.type = 'html'
   *     response.type = 'json'
   *     response.type = 'png'
   */
  public set type (value: string) {
    let type = ct.normalize(value)

    if (type) this.set('Content-Type', type)
  }

  /**
   * Return the response mime type void of the "charset" parameter, or undefined
   */
  public get type (): string {
    return ct.extract(this.get('Content-Type') as string) as string
  }

  /**
   * Set `Content-Length` reponse header
   */
  public set length (value: number) {
    this.set('Content-Length', value)
  }

  /**
   * Get the response content length or NaN otherwise.
   */
  public get length (): number {
    return this.get('Content-Length') as number || cl.from(this.body)
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
      if (!statuses.isEmpty(this.status)) this.status = 204

      this._clearBody()
      return
    }

    this._body = value

    // status code
    this.status = 200

    // content type
    if (!this.has('Content-Type')) {
      this.set('Content-Type', ct.from(value))
    }
  }

  /**
   * Set the `Last-Modified` response header
   */
  public set lastModified (value: Date) {
    this.set('Last-Modified', value.toUTCString())
  }

  /**
   * Get the `Last-Modified` date, or undefined if not present
   */
  public get lastModified (): Date {
    let date = this.get('Last-Modified') as string

    return date ? new Date(date) : undefined as any
  }

  /**
   * Set the `ETag` of the response.
   * 
   * This will normalize the quotes if necessary.
   * 
   * Examples:
   * 
   *     response.etag = 'md5hashsum'
   *     response.etag = '"md5hashsum"'
   *     response.etag = 'W/"123456789"'
   */
  public set etag (value: string) {
    if (!/^(W\/)?"/.test(value)) value = `"${value}"`

    this.set('ETag', value)
  }

  /**
   * Get the `ETag` of the response.
   */
  public get etag (): string {
    return this.get('ETag') as string
  }

  /**
   * Set the `Location` response header
   */
  public set location (url: string) {
    this.set('Location', encodeURI(url))
  }

  /**
   * Get the `Location` response header
   */
  public get location (): string {
    return this.get('Location') as string
  }

  /**
   * Append `field` to the `Vary` header
   * 
   * @param headers
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
   * Set cookie `name` to `value`, with the given `options`.
   * 
   * Examples:
   * 
   *    // "Remember Me" for 15 minutes
   *    res.cookie('remember', '1', { expires: new Date(Date.now() + 900000), httpOnly: true })
   * 
   *    // same as above
   *    res.cookie('remember', '1', { maxAge: 900000, httpOnly: true })
   * 
   * @param name
   * @param value
   * @param options
   */
  public setCookie (name: string, value: string, options?: cookie.SerializeOptions): this {
    return this.append('Set-Cookie', cookie.serialize(name, value, options))
  }

  /**
   * Unset the cookie `name`.
   * 
   * @param name
   * @param options
   */
  public clearCookie (name: string, options?: cookie.SerializeOptions): this {
    return this.setCookie(name, '', { expires: new Date(0), ...options })
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
    this._headers = Object.create(null)

    if (headers) this.set(headers)

    return this
  }

  /**
   * Send and end the response stream
   * 
   * @param res
   */
  public send (res: ServerResponse): void {
    // socket not writable
    if (!isWritable(res)) return

    let { body: content, status } = this

    if (!res.headersSent) {
      // FIXME: `res.writeHead` is slow
      // res.writeHead(status, this.message, this.headers)

      res.statusCode = status
      res.statusMessage = this.message

      for (let field in this.headers) {
        res.setHeader(field, this.headers[field] as any)
      }
    }

    // ignore body
    if (statuses.isEmpty(status)) return res.end()

    // stream
    if (isStream(content)) {
      content.pipe(res)
      return
    }

    // status body
    if (content == null) {
      content = this.message || String(status)
      this.set('Content-Type', 'text/plain; charset=utf-8')
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
  private _clearBody () {
    this.remove('Transfer-Encoding')
    this.remove('Content-Length')
    this.remove('Content-type')
    this._body = null
  }
}
