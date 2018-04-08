
import { Context } from './types'

export default class {
  private _store: Context = Object.create(null)

  /**
   * Extend the context store by adding shared properties
   * 
   * @param prop
   * @param value
   */
  public set (prop: string, value: any): void {
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
  public bind (prop: string, fn: (ctx: Context) => any): void {
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
  public get (prop: string): any {
    return this._store[prop]
  }

  /**
   * Check if the prop is defined in the context store
   * 
   * @param prop
   */
  public has (prop: string): boolean {
    return prop in this._store
  }

  /**
   * Create a request context store
   * 
   * @param req
   * @param res
   */
  public from (req: any, res: any): Context {
    var ctx = Object.create(this._store)

    ctx.res = res
    ctx.req = req

    return ctx
  }
}
