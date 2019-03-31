
'use strict'

const { Dispatcher } = require('@aldojs/middleware')


exports.Application = class extends Dispatcher {
  /**
   * 
   * @param {Function[]} middlewares 
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
   * @param {String | Symbol} name The binding name
   * @param {Any} value The binding value
   * @public
   */
  set (name, value) {
    this._container.set(name, value)
    return this
  }

  /**
   * Return the binding value
   *
   * @param {String | Symbol} name The binding name
   * @public
   */
  get (name) {
    return this._container.get(name)
  }

  /**
   * Check if the binding name is already registered
   *
   * @param {String | Symbol} name The binding name
   * @public
   */
  has (name) {
    return this._container.has(name)
  }

  /**
   * Create a proxy of the context object.
   * 
   * @param {Object} context 
   * @private
   */
  _proxify (context) {
    return new Proxy(context, this._proxyHandler)
  }
}
