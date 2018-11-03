
export type Middleware<T> = (context: T, next: () => any) => any

export type Factory = (c: Container, ...args: any[]) => any

export interface Dispatcher<T> {
  use (fn: Middleware<T>): any
  dispatch (context: T): any
}

export interface Container {
  bound(name: string): boolean
  bind(name: string, fn: Factory): any
  make(name: string, ...args: any[]): any
}

export interface Context {
  [key: string]: any
}

export class Application<T extends Context> {
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
      get: (ctx, prop: string) => {
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
   * Handle the context and return the result
   * 
   * @param context 
   * @public
   */
  public handle (context: T): any {
    return this._dispatch(this._proxify(context))
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
   * @param context 
   * @private
   */
  private _proxify (context: T): T {
    return new Proxy(context, this._handler)
  }

  /**
   * Dispatch the context to the middlewares.
   * 
   * @param context
   * @private
   */
  private _dispatch (context: T): any {
    return this._dispatcher.dispatch(context)
  }
}
