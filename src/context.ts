
import Request from './request'

export interface Context {
  [field: string]: any;
  request: Request;
}

export default class ContextBuilder {
  /**
   * The context store
   */
  private _store = Object.create(null)

  /**
   * Extend the context store by adding shared properties
   *
   * @param prop
   * @param value
   */
  set (prop: string, value: any) {
    Reflect.defineProperty(this._store, prop, {
      configurable: true,
      enumerable: true,
      writable: true,
      value
    })
  }

  /**
   * Extend the context store by adding per instance property
   *
   * @param prop
   * @param fn
   */
  bind (prop:  string, fn: (ctx: Context) => any) {
    var field = `_${prop}`

    Reflect.defineProperty(this._store, prop, {
      configurable: true,
      enumerable: true,
      get () {
        if ((this as Context)[field] === undefined) {
          // private property
          Reflect.defineProperty(this, field, {
            value: fn(this as Context)
          })
        }

        return (this as Context)[field]
      }
    })
  }

  /**
   * Get a value from the context store
   *
   * @param prop
   */
  get (prop: string): any {
    // TODO: prevent returning fields created with `bind`
    return this._store[prop]
  }

  /**
   * Check if the prop is defined in the context store
   *
   * @param prop
   */
  has (prop: string): boolean {
    return prop in this._store
  }

  /**
   * Create a new context store
   *
   * @param request
   */
  create (request: Request): Context {
    var ctx = Object.create(this._store)

    ctx.request = request

    return ctx
  }
}
