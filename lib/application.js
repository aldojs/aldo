
'use strict'


exports.Application = class {
  /**
   * 
   * @param {Dispatcher} dispacher 
   * @param {Container} container 
   */
  constructor (dispacher, container) {
    this._container = container
    this._dispatcher = dispacher

    // proxy handler
    this._handler = {
      get: (ctx, prop) => {
        return ctx[prop] || (ctx[prop] = container.make(prop, ctx))
      }
    }
  }

  /**
   * Use a middleware.
   *
   * @param {function} fn The middleware function.
   * @throws `TypeError` if the middleware is not a function.
   * @public
   */
  use (fn) {
    this._dispatcher.use(fn)
    return this
  }

  /**
   * Handle the context and return the result
   * 
   * @param {object} context 
   * @public
   */
  handle (context) {
    return this._dispatch(this._proxify(context))
  }

  /**
   * Register a binding in the container
   *
   * @param {string} name The binding name.
   * @param {funciton} fn The factory function.
   * @throws `TypeError` if the factory is not a function.
   * @public
   */
  bind (name, fn) {
    this._container.bind(name, fn)
    return this
  }

  /**
   * Register a raw binding
   *
   * @param {string} name The binding name
   * @param {any} value The binding value
   * @public
   */
  set (name, value) {
    return this.bind(name, () => value)
  }

  /**
   * Return the raw binding value
   *
   * @param {string} name The binding name
   * @public
   */
  get (name) {
    return this._container.make(name)
  }

  /**
   * Check if the binding name is already registered
   *
   * @param {string} name The binding name
   * @public
   */
  has (name) {
    return this._container.bound(name)
  }

  /**
   * Create a context proxy.
   * 
   * @param {object} context 
   * @private
   */
  _proxify (context) {
    return new Proxy(context, this._handler)
  }

  /**
   * Dispatch the context to the middlewares.
   * 
   * @param {object} context 
   * @private
   */
  _dispatch (context) {
    return this._dispatcher.dispatch(context)
  }
}
