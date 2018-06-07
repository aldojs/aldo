
/**
 * Service container class
 */
export class Container {
  /**
   * The factories map
   * 
   * @private
   */
  private _factories: Map<string, Function>

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
   * Invoke the factory and return its value
   * 
   * @param name 
   * @public
   */
  public get (name: string): any {
    let fn = this._factories.get(name)

    if (fn) return fn(this)
  }

  /**
   * Set a factory by name
   * 
   * @param name 
   * @param fn 
   * @public
   */
  public set (name: string, fn: (c: Container) => any): this {
    this._factories.set(name, fn)
    return this
  }

  /**
   * Check if a factory name exists
   * 
   * @param name 
   * @public
   */
  public has (name: string): boolean {
    return this._factories.has(name)
  }
}
