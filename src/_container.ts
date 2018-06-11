
export class Container<T> {
  /**
   * The factories map
   * 
   * @private
   */
  private _factories: Map<string, (c: T) => any>

  /**
   * Initialize a new container instance
   * 
   * @param map The factories map
   * @constructor
   * @public
   */
  public constructor (map = new Map()) {
    this._factories = map
  }

  /**
   * Add a factory
   * 
   * @param name 
   * @param fn 
   * @public
   */
  public set (name: string, fn: (c: T) => any) {
    this._factories.set(name, fn)
    return this
  }

  /**
   * Invoke the factory and return the value
   * 
   * @param name 
   * @param c 
   * @public
   */
  public get (name: string, c: T): any {
    let fn = this._factories.get(name)

    if (fn) return fn(c)
  }

  /**
   * Check a factory is already registered
   * 
   * @param name 
   * @public
   */
  public has (name: string) {
    return this._factories.has(name)
  }
}
