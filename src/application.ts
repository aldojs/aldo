
export type Middleware<T> = (input: T, next: () => any) => any

export type Factory = (c: Container, ...args: any[]) => any

export interface Dispatcher<T> {
  use (fn: Middleware<T>): any
  dispatch (input: T): any
}

export interface Container {
  bound(name: string): boolean
  bind(name: string, fn: Factory): this
  make(name: string, ...args: any[]): any
  singleton(name: string, fn: Factory): this
}

export class Application<T extends object> {
  /**
   * The service container
   * 
   * @private
   */
  private _container: Container

  /**
   * The middleware dispatcher
   * 
   * @private
   */
  private _dispatcher: Dispatcher<T>

  /**
   * The proxy handler
   * 
   * @private
   */
  private _handler: ProxyHandler<T>

  /**
   * Initialize a new application instance
   * 
   * @param options The application options
   * @constructor
   * @public
   */
  public constructor (dispatcher: Dispatcher<T>, container: Container) {
    this._container = container
    this._dispatcher = dispatcher

    this._handler = {
      get: (ctx: any, prop: string) => {
        return ctx[prop] || (ctx[prop] = container.make(prop, ctx))
      }
    }
  }

  /**
   * Use a middleware.
   *
   * @param fn The middleware function.
   * @throws `TypeError` if the middleware is not a function.
   * @public
   */
  public use (fn: Middleware<T>) {
    this._dispatcher.use(fn)
    return this
  }

  /**
   * Handle the input and return the result
   * 
   * @param input 
   * @public
   */
  public handle (input: T): any {
    return this._dispatch(this._proxify(input))
  }

  /**
   * Register a binding in the container
   *
   * @param name The binding name.
   * @param fn The factory function.
   * @throws `TypeError` if the factory is not a function.
   * @public
   */
  public bind (name: string, fn: Factory) {
    this._container.bind(name, fn)
    return this
  }

  /**
   * Register a singleton binding in the container
   *
   * @param name The binding name
   * @param fn The factory function
   * @throws `TypeError` if the factory is not a function.
   * @public
   */
  public singleton (name: string, fn: Factory) {
    this._container.singleton(name, fn)
    return this
  }

  /**
   * Resolve the given binding from the container
   *
   * @param name The binding name
   * @param args 
   * @public
   */
  public make (name: string, ...args: any[]): any {
    return this._container.make(name, ...args)
  }

  /**
   * Register a raw binding
   *
   * @param name The binding name
   * @param value The binding value
   * @public
   */
  public set (name: string, value: any) {
    return this.bind(name, () => value)
  }

  /**
   * Return the raw binding value
   *
   * @param name The binding name
   * @public
   */
  public get (name: string): any {
    return this._container.make(name)
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
   * Create a context proxy.
   * 
   * @param input 
   * @private
   */
  private _proxify (input: T): T {
    return new Proxy(input, this._handler)
  }

  /**
   * Dispatch the input to the middlewares.
   * 
   * @param input
   * @private
   */
  private _dispatch (input: T): any {
    return this._dispatcher.dispatch(input)
  }
}
