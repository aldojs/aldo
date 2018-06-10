
import is from '@sindresorhus/is'
import * as createDebugger from 'debug'
import { Dispatcher, IMiddleware } from './_dispatcher'

const debug = createDebugger('aldo:application')

export interface IDispatcher {
  dispatch (ctx: Context): any
  use (fn: Middleware): void
}

export type Factory = (c: Context) => any

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
  protected _factories = new Map<string, Factory>()

  /**
   * The middleware dispatcher
   * 
   * @private
   */
  private _dispatcher: IDispatcher

  /**
   * The context proxy handler
   * 
   * @protected
   */
  protected _handler: object

  /**
   * Initialize a new application instance
   * 
   * @param options The application options
   * @constructor
   * @public
   */
  public constructor ( dispatcher: IDispatcher = new Dispatcher()) {
    this._dispatcher = dispatcher

    this._handler = {
      get: (ctx: Context, prop: string) => {
        if (ctx[prop] == null) {
          let fn = this._factories.get(prop)

          if (fn) ctx[prop] = fn(ctx)
        }

        return ctx[prop]
      }
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
      throw new TypeError(`Expect a function but got: ${is(fn)}`)
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
  public handle (request: any): any {
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
      throw new TypeError(`Expect a function but got: ${is(fn)}`)
    }

    debug(`register a new binding: ${name}`)
    this._factories.set(name, fn)
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
    debug(`register a shared binding: ${name}`)
    this._factories.set(name, () => value)
    return this
  }

  /**
   * Resolve the given binding from the container
   *
   * @param name The binding name
   * @public
   */
  public get (name: string): any {
    let fn = this._factories.get(name)

    if (fn) return fn(this._createContext(null))
  }

  /**
   * Check if the binding name is already defined
   *
   * @param name The binding name
   * @public
   */
  public has (name: string): boolean {
    return this._factories.has(name)
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
