
'use strict'

const { Dispatcher } = require('@aldojs/middleware')


exports.Application = class extends Dispatcher {
  /**
   * 
   * @param {Array} middlewares 
   * @param {Map} map 
   */
  constructor (middlewares, map) {
    super(middlewares)

    this._container = map

    this._proxyHandler = {
      get: (ctx, prop) => ctx[prop] || (ctx[prop] = map.get(prop))
    }
  }

  /**
   * Dispatch the context and return the result
   * 
   * @param {Object} context 
   * @override
   * @public
   */
  dispatch (context) {
    return super.dispatch(this._proxify(context))
  }

  /**
   * Bind a context property
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
  _proxify (target) {
    return new Proxy(target, this._proxyHandler)
  }
}
