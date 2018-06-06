
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
   * Register a binding in the container
   *
   * @param name The binding name
   * @param fn The factory function
   * @public
   */
  public bind (name: string, fn: Factory) {
    if (!is.function_(fn)) {
      throw new TypeError(`Expect a function but got: ${is(fn)}.`)
    }

    debug(`set a per-request context property: ${name}`)
    this._container.set(name, fn)
    return this
  }

  /**
   * Register a value as a shared binding in the container
   *
   * @param name The binding name
   * @param value The shared value
   * @public
   */
  public set (name: string, value: any) {
    debug(`set a shared context property: ${name}`)
    this._container.set(name, () => value)
    return this
  }

  /**
   * Resolve the given binding from the container
   *
   * @param name The binding name
   * @public
   */
  public get (name: string): any {
    return this._container.get(name)
  }

  /**
   * Check if the prop is defined in the app context
   *
   * @param name The binding name
   * @public
   */
  public has (name: string): boolean {
    return this._container.has(name)
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
