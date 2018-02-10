
import * as http from 'http'
import { Request, Response } from 'aldo-http'

declare type Literal = { [x: string]: any }

declare type RouteHandler = (ctx: Context) => any

declare type Factory = (app?: Container, ...args: any[]) => any

declare type RouteStoreEntry = { handler: RouteHandler, params: Literal }

declare type Middleware = (ctx: Context, next: (error?: any) => any) => any

declare interface Container {
  has (key: string | symbol): boolean
  get (key: string | symbol, ...args: any[]): any
  singleton (key: string | symbol, fn: Factory): any
  set (key: string | symbol, value: object | Factory): any
}

declare interface Dispatcher {
  use (router: Router): any
  pre (fn: Middleware): any
  post (fn: Middleware): any
  catch (fn: Middleware): any
  dispatch (ctx: Context): any
  finally (fn: RouteHandler): any
}

declare interface Context extends Literal {
  response: Response
  request: Request
  app: Container
}

declare interface Route {
  readonly path: string
  readonly name: string

  as (name: string): any
  prefix (value: string): any
  all (...fns: Middleware[]): any
  get (...fns: Middleware[]): any
  put (...fns: Middleware[]): any
  head (...fns: Middleware[]): any
  post (...fns: Middleware[]): any
  patch (...fns: Middleware[]): any
  delete (...fns: Middleware[]): any
  options (...fns: Middleware[]): any
  any (methods: string[], ...fns: Middleware[]): any
  handlers (): IterableIterator<[string, Middleware[]]>
}

declare interface Router {
  routes (): Route[]
  use (fn: Middleware): any
  prefix (value: string): any
  route (path: string): Route
  all (path: string, ...fn: Middleware[]): any
  get (path: string, ...fn: Middleware[]): any
  put (path: string, ...fn: Middleware[]): any
  head (path: string, ...fn: Middleware[]): any
  post (path: string, ...fn: Middleware[]): any
  patch (path: string, ...fn: Middleware[]): any
  delete (path: string, ...fn: Middleware[]): any
  options (path: string, ...fn: Middleware[]): any
  any (method: string[], path: string, ...fns: Middleware[]): any
}

// declare interface Request {
//   body: any                               // request body
//   url: string                             // url pathname
//   host: string                            // request host header
//   type: string                            // request content type
//   method: string                          // request method
//   length: number                          // request content length
//   query: Literal                          // url query object
//   secure: boolean                         // encrypted request
//   charset: string                         // request content charset
//   protocol: string                        // url protocol
//   querystring: string                     // url query string
//   headers: http.IncomingHttpHeaders       // request headers

//   has (header: string): boolean
//   get (header: string): string | string[]
//   is (...types: string[]): string | false
//   accepts (...types: string[]): string[] | string | false
//   acceptsCharset (...args: string[]): string[] | string | false
//   acceptsEncoding (...args: string[]): string[] | string | false
//   acceptsLanguage (...args: string[]): string[] | string | false
// }

// declare interface Response {
//   body: any                               // content body
//   type: string                            // content type
//   length: number                          // content length
//   status: number                          // response status code
//   message: string                         // response status message
//   headers: http.OutgoingHttpHeaders       // response headers

//   reset (): any
//   send (content?: any): void
//   remove (header: string): any
//   has (header: string): boolean
//   is (...types: string[]): string | false
//   get (header: string): string | number | string[]
//   append (header: string, value: string | string[]): any
//   set (header: string, value: string | number | string[]): any
// }

// declare interface Cookies {
//   get (name: string): any
//   set (name: string, value: any, options?: Literal): void
// }
