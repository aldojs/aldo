
export interface IContainer {
  proxify (input: any, field: string): Context
  make (name: string, ctx: Context): any
  bind (name: string, fn: Factory): any
  bound (name: string): boolean
}

export type Context = { [field: string]: any }

export type Factory = (c: Context) => any

export class Container implements IContainer {
  /**
   * The factories map
   * 
   * @private
   */
  private _factories: Map<string, Factory>

  /**
   * The proxy handler
   * 
   * @private
   */
  private _handler: ProxyHandler<Context>

  /**
   * Initialize a new container instance
   * 
   * @param map The factories map
   * @constructor
   * @public
   */
  public constructor (map = new Map()) {
    this._factories = map

    this._handler = {
      get: (ctx, prop: string) => {
        return ctx[prop] || (ctx[prop] = this.make(prop, ctx))
      }
    }
  }

  /**
   * Add a service factory
   * 
   * @param name The service name
   * @param fn The service factory
   * @public
   */
  public bind (name: string, fn: Factory): this {
    this._factories.set(name, fn)
    return this
  }

  /**
   * Invoke the factory and return its value
   * 
   * @param name 
   * @param ctx 
   * @public
   */
  public make (name: string, ctx: Context): any {
    let fn = this._factories.get(name)

    if (fn) return fn(ctx)
  }

  /**
   * Check a factory is already registered
   * 
   * @param name 
   * @public
   */
  public bound (name: string): boolean {
    return this._factories.has(name)
  }

  /**
   * Create a context proxy
   * 
   * @param input The input argument to dispatch
   * @public
   */
  public proxify (input: any, field: string): Context {
    return new Proxy({ [field]: input }, this._handler)
  }
}
