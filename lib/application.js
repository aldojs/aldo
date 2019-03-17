
'use strict'


exports.Application = class {
  /**
   * 
   * @param {Object} dispatcher 
   * @param {Map} map 
   */
  constructor (dispatcher, map) {
    this._container = map

    this._handle = (ctx) => dispatcher.dispatch(ctx)

    this._proxyHandler = {
      get: (ctx, prop) => ctx[prop] || (ctx[prop] = map.get(prop))
    }
  }

  /**
   * Use a middleware.
   *
   * @param {Function} middleware 
   * @throws if the middleware is not, or doesn't return, a function.
   * @public
   */
  use (middleware) {
    if (typeof middleware !== 'function') {
      throw new TypeError(`The middleware should be a function.`)
    }

    let handler = middleware(this._handle)

    if (typeof handler !== 'function') {
      throw new TypeError(`The middleware should return a function.`)
    }

    this._handle = handler
    return this
  }

  /**
   * Handle the context and return the result
   * 
   * @param {Object} context 
   * @public
   */
  handle (context) {
    return this._handle(this._proxify(context))
  }

  /**
   * Bind context property
   *
   * @param {string} name The binding name
   * @param {any} value The binding value
   * @public
   */
  set (name, value) {
    this._container.set(name, value)
    return this
  }

  /**
   * Return the binding value
   *
   * @param {string} name The binding name
   * @public
   */
  get (name) {
    return this._container.get(name)
  }

  /**
   * Check if the binding name is already registered
   *
   * @param {string} name The binding name
   * @public
   */
  has (name) {
    return this._container.has(name)
  }

  /**
   * Create a context proxy.
   * 
   * @param {Object} context 
   * @private
   */
  _proxify (context) {
    return new Proxy(context, this._proxyHandler)
  }
}
