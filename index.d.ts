
/// <reference types="node" />

import * as compose from 'aldo-compose';
import { Http2ServerRequest, Http2ServerResponse } from 'http2';
import { IncomingMessage, ServerResponse, Server, IncomingHttpHeaders, OutgoingHttpHeaders } from 'http';

export interface Context {
  request: Request;
  [field: string]: any;
}

export type Middleware = compose.Middleware<Context>;

export type RequestStream = IncomingMessage | Http2ServerRequest;

export type ResponseStream = ServerResponse | Http2ServerResponse;

export class Application {
  /**
   * Extend the app context by adding per instance property
   *
   * @param prop
   * @param fn
   */
  bind(prop: string, fn: (ctx: Context) => any): this;

  /**
   * Extend the app context by adding shared properties
   *
   * @param prop
   * @param value
   */
  set(prop: string, value: any): this;

  /**
   * Get a value from the app context
   *
   * @param prop
   */
  get(prop: string): any;

  /**
   * Check if the prop is defined in the app context
   *
   * @param prop
   */
  has(prop: string): boolean;

  /**
   * Use request middleware
   *
   * @param fn
   */
  use(fn: Middleware): this;

  /**
   * Shorthand for:
   *
   *     http.createServer(app.callback()).listen(...args)
   */
  listen(...args: any[]): Server;

  /**
   * Return a request listener
   */
  callback(): (req: RequestStream, res: ResponseStream) => void;
}

export class Request {
  /**
   * The request body
   */
  body: any;

  /**
   * Native HTTP request
   */
  stream: RequestStream;

  /**
   * Contruct a new request instance
   *
   * @param req
   * @param options
   */
  constructor(req: RequestStream, options?: { proxy?: boolean });

  /**
   * The request headers
   */
  readonly headers: IncomingHttpHeaders;

  /**
   * The URL pathname
   */
  readonly url: string;

  /**
   * Request method
   */
  readonly method: string;

  /**
   * URL query string
   */
  readonly querystring: string;

  /**
   * Request mime type, void of parameters such as "charset", or undefined
   */
  readonly type: string | undefined;

  /**
   * Get the charset when present or undefined
   */
  readonly charset: string | undefined;

  /**
   * Returns the parsed Content-Length when present or NaN
   */
  readonly length: number;

  /**
   * Returns true when requested with TLS, false otherwise
   */
  readonly secure: boolean;

  /**
   * "Host" header value
   */
  readonly host: string | undefined;

  /**
   * Return the protocol string "http" or "https" when requested with TLS
   */
  readonly protocol: string;

  /**
   * Origin of the URL
   */
  readonly origin: string;

  /**
   * IP address list when a `proxy` is enabled
   */
  readonly ips: string[];

  /**
   * Remote IP address
   */
  readonly ip: string | undefined;

  /**
   * Returns the request header value
   *
   * Case insensitive name matching.
   *
   * The `Referrer` header field is special-cased,
   * both `Referrer` and `Referer` are interchangeable.
   *
   * Examples:
   *
   *     this.get('Content-Type')
   *     // => "text/plain"
   *
   *     this.get('content-type')
   *     // => "text/plain"
   *
   *     this.get('Something')
   *     // => undefined
   *
   * @param header
   */
  get(header: string): string | string[] | undefined;

  /**
   * Check if the header is present
   *
   * Case insensitive name matching.
   *
   * The `Referrer` header field is special-cased,
   * both `Referrer` and `Referer` are interchangeable.
   *
   * Examples:
   *
   *     this.has('Content-Type')
   *     // => true
   *
   *     this.has('content-type')
   *     // => true
   *
   *     this.has('Something')
   *     // => false
   *
   * @param header
   */
  has(header: string): boolean;

  /**
   * Check if the incoming request contains the "Content-Type"
   * header field, and it contains any of the give mime `type`s.
   *
   * It returns the first matching type or false otherwise
   *
   * Examples:
   *
   *     // With Content-Type: text/html charset=utf-8
   *     this.is('html') // => 'html'
   *     this.is('text/html') // => 'text/html'
   *     this.is('text/*', 'application/json') // => 'text/html'
   *
   *     // When Content-Type is application/json
   *     this.is('json', 'urlencoded') // => 'json'
   *     this.is('application/json') // => 'application/json'
   *     this.is('html', 'application/*') // => 'application/json'
   *
   *     this.is('html') // => false
   *
   * @param types
   */
  is(...types: string[]): string | false;

  /**
   * Check if the given `type(s)` is acceptable, returning
   * the best match when true, otherwise `false`, in which
   * case you should respond with 406 "Not Acceptable".
   *
   * It returns an array of accepted mime types
   * ordered by "qvalue" parameter, if no argument given
   *
   * The `type` value may be a single mime type string
   * such as "application/json", the extension name
   * such as "json" or an array `["json", "html", "text/plain"]`. When a list
   * or array is given the _best_ match, if any is returned.
   *
   * Examples:
   *
   *     // with Accept: text/html
   *     this.accept('html')
   *     // => "html"
   *
   *     // with Accept: text/*, application/json
   *     this.accept('html')
   *     // => "html"
   *     this.accept('text/html')
   *     // => "text/html"
   *     this.accept('json', 'text')
   *     // => "json"
   *     this.accept('application/json')
   *     // => "application/json"
   *
   *     // with Accept: text/*, application/json
   *     this.accept('image/png')
   *     this.accept('png')
   *     // => false
   *
   *     // with Accept: text/*q=.5, application/json
   *     this.accept('html', 'json')
   *     // => "json"
   *
   *     // with Accept: text/*, application/json
   *     this.accept()
   *     // => ["text/*", "application/json"]
   *
   * @param types
   */
  accept(...types: string[]): string | false | string[];

  /**
   * Return accepted charsets or best fit based on `charsets`.
   *
   * If no argument supplied, it returns all accepted charsets sorted by "qvalue"
   *
   * Examples:
   *
   *     // with Accept-Charset: utf-8, iso-8859-1q=0.2, utf-7q=0.5
   *     this.acceptCharset()
   *     // => ['utf-8', 'utf-7', 'iso-8859-1']
   *     this.acceptCharset('utf-8', 'iso-8859-1')
   *     // => "utf-8"
   *     this.acceptCharset('utf-16')
   *     // => false
   *
   * @param args
   */
  acceptCharset(...args: string[]): string | false | string[];

  /**
   * Returns accepted encodings or best fit based on `encodings`.
   *
   * If no argument supplied, it returns all accepted encodings sorted by "qvalue"
   *
   * Examples:
   *
   *     // with Accept-Encoding: gzip, deflate
   *     this.acceptEncoding()
   *     // => ['gzip', 'deflate']
   *     this.acceptEncoding('br', 'gzip')
   *     // => "gzip"
   *     this.acceptEncoding('br')
   *     // => false
   *
   * @param args
   */
  acceptEncoding(...args: string[]): string | false | string[];

  /**
   * Return accepted languages or best fit based on `langs`.
   *
   * If no argument supplied, it returns all accepted languages sorted by "qvalue"
   *
   * Examples:
   *
   *     // with Accept-Language: enq=0.8, es, pt
   *     this.acceptLanguage()
   *     // => ['es', 'pt', 'en']
   *     this.acceptLanguage('en', 'pt')
   *     // => "en"
   *     this.acceptLanguage('fr')
   *     // => false
   *
   * @param args
   */
  acceptLanguage(...args: string[]): string | false | string[];
}

export class Response {
  /**
   * The status code
   */
  statusCode: number;

  /**
   * The status message
   */
  statusMessage: string;

  /**
   * Construct a new response builder
   *
   * @param body
   */
  constructor(body?: any);

  /**
   * Create a response instance from the given content
   * 
   * @param content The response body
   */
  static from (content: any): Response;

  /**
   * The response body
   */
  readonly body: any;

  /**
   * Get the response headers
   * 
   * Shortcut to `response.stream.getHeaders()`
   */
  readonly headers: OutgoingHttpHeaders;

  /**
   * Set the response status code
   * 
   * @throws `AssertionError` if the code is invalid
   */
  status(code: number): this;

  /**
   * Response mime type void of the "charset" parameter, or undefined
   * 
   * Set `Content-Type` response header.
   * 
   * Will add the the charset if not present.
   * 
   * Examples:
   * 
   *     response.type('.html')
   *     response.type('html')
   *     response.type('json')
   *     response.type('application/json')
   *     response.type('png')
   */
  type(value: string): this;

  /**
   * Get or set the `Content-Length` header value
   */
  length(value: number);

  /**
   * `Last-Modified` header value, or undefined if not present
   */
  lastModified(value: string |Date);

  /**
   * Get or set the `ETag` of the response.
   *
   * This will normalize the quotes if necessary.
   *
   * Examples:
   *
   *     response.etag('md5hashsum')
   *     response.etag('"md5hashsum"')
   *     response.etag('W/"123456789"')
   */
  etag(value: string);

  /**
   * Get or set the `Location` response header
   */
  location(value: string);

  /**
   * Append `field` to the `Vary` header
   */
  vary(...field: string[]): this;

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
  is(...types: string[]): string | false;

  /**
   * Get the response header if present, or undefined
   *
   * @param header
   */
  get(header: string): string | number | string[] | undefined;

  /**
   * Set the response header, or pass an object of header fields.
   *
   * Example:
   *
   *    response.set({ Accept: 'text/plain', 'X-API-Key': 'tobi' })
   *
   * @param headers
   */
  set(headers: { [field: string]: string | number | string[]; }): this;

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
  set(header: string, value: string | number | string[]): this;

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
  append(header: string, value: string | string[]): this;

  /**
   * Check if response header is defined
   *
   * @param header
   */
  has(header: string): boolean;

  /**
   * Remove the response header
   *
   * @param header
   */
  remove(header: string): this;

  /**
   * Reset all response headers
   *
   * @param headers
   */
  reset(headers?: { [field: string]: string | number | string[]; }): this;

  /**
   * Send and end the response stream
   */
  end(res: ResponseStream): void;
}
