
import is from '@sindresorhus/is'
import * as createDebugger from 'debug'
import { Container } from './_container'
import { Dispatcher, IMiddleware } from './_dispatcher'

const debug = createDebugger('aldo:application')

export interface IDispatcher {
  dispatch (ctx: Context): any
  use (fn: Middleware): void
}

export interface IContainer {
  set (field: string, fn: Factory): any
  has (field: string): boolean
  get (field: string): any
}

export type Factory = (c: IContainer) => any

export type Middleware = IMiddleware<Context>

export type Context = {
  [field: string]: any
}

export class Application {
  /**
   * The service container
   * 
   * @protected
   */
  protected _container: IContainer = new Container()

  /**
   * The middleware dispatcher
   * 
   * @private
   */
  private _dispatcher: IDispatcher = new Dispatcher<Context>()

  /**
   * The context proxy handler
   * 
   * @protected
   */
  protected _handler: object = {
    get: (ctx: Context, prop: string) => {
      return ctx[prop] || (ctx[prop] = this.get(prop))
    }
  }

  /**
   * Use a middleware
   *
   * @param fn
   * @public
   */
  public use (fn: Middleware) {
    if (!is.function_(fn)) {
      throw new TypeError(`Expect a function but got: ${is(fn)}.`)
    }

    debug(`use middleware: ${fn.name || '<anonymous>'}`)
    this._dispatcher.use(fn)
    return this
  }

  /**
   * Handle the incoming request and return the response
   * 
   * @param request The incoming request
   * @public
   */
  public async handle (request: { url: string, method: string }): Promise<any> {
    debug(`dispatching: ${request.method} ${request.url}`)
    return this._dispatcher.dispatch(this._createContext(request))
  }

  /**
   * Extend the app context by adding per instance property
   *
   * @param prop
   * @param fn
   * @public
   */
  public bind (prop: string, fn: Factory) {
    if (!is.function_(fn)) {
      throw new TypeError(`Expect a function but got: ${is(fn)}.`)
    }

    debug(`set a per-request context property: ${prop}`)
    this._container.set(prop, fn)
    return this
  }

  /**
   * Extend the app context by adding shared properties
   *
   * @param prop
   * @param value
   * @public
   */
  public set (prop: string, value: any) {
    debug(`set a shared context property: ${prop}`)
    this._container.set(prop, () => value)
    return this
  }

  /**
   * Get a value from the app context
   *
   * @param prop
   * @public
   */
  public get (prop: string): any {
    return this._container.get(prop)
  }

  /**
   * Check if the prop is defined in the app context
   *
   * @param prop
   * @public
   */
  public has (prop: string): boolean {
    return this._container.has(prop)
  }

  /**
   * Create a request context
   * 
   * @param request The incoming request
   * @protected
   */
  protected _createContext (request: any): Context {
    return new Proxy({ request }, this._handler)
  }
}
