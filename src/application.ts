
import is from '@sindresorhus/is'
import { Dispatcher, Middleware, IDispatcher } from './dispatcher'
import { Container, Context, IContainer, Factory } from './container'

export type Options = {
  dispatcher?: IDispatcher
  container?: IContainer
  inputField?: string
}

export class Application {
  /**
   * The service container
   * 
   * @private
   */
  private _container: IContainer

  /**
   * The middleware dispatcher
   * 
   * @private
   */
  private _dispatcher: IDispatcher

  /**
   * The default input field name
   * 
   * @private
   */
  private _field: string

  /**
   * Initialize a new application instance
   * 
   * @param options The application options
   * @constructor
   * @public
   */
  public constructor ({
    dispatcher = new Dispatcher(),
    container = new Container(),
    inputField = 'input'
  }: Options = {}) {
    this._field = inputField
    this._container = container
    this._dispatcher = dispatcher
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

    this._dispatcher.use(fn)
    return this
  }

  /**
   * Handle the incoming request and return the response
   * 
   * @param input The incoming request
   * @public
   */
  public handle (input: any): any {
    return this._dispatch(this._createContext(input))
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

    this._container.bind(name, fn)
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
    this._container.bind(name, () => value)
    return this
  }

  /**
   * Resolve the given binding from the container
   *
   * @param name The binding name
   * @public
   */
  public get (name: string): any {
    return this._container.make(name, this._createContext(null))
  }

  /**
   * Check if the binding name is already registered
   *
   * @param name The binding name
   * @public
   */
  public has (name: string): boolean {
    return this._container.bound(name)
  }

  /**
   * Create a context
   * 
   * @param input The input argument to dispatch
   * @private
   */
  private _createContext (input: any): Context {
    return this._container.proxify(input, this._field)
  }

  /**
   * Dispatch a context to middlewares
   * 
   * @param context
   * @private
   */
  private _dispatch (context: Context): any {
    return this._dispatcher.dispatch(context)
  }
}
