
/**
 * Service container class
 */
export class Container {
  /**
   * The factories map
   * 
   * @private
   */
  private _factories = new Map<string, Function>()

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

  public alias (name: string, field: string) {
    this.set(name, this.get(field))
  }

  /**
   * Set a factory by name
   * 
   * @param name 
   * @param fn 
   * @public
   */
  public set (name: string, fn: (c: Container) => any): void {
    this._factories.set(name, fn)
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
