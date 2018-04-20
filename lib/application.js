
'use strict'

const assert = require('assert')
const { createServer } = require('http')
const { setImmediate } = require('timers')
const debug = require('debug')('aldo:application')
const { default: compose } = require('aldo-compose')
const { default: ContextFactory } = require('aldo-context')

/**
 * @class Application
 */
module.exports = class {
  /**
   * Initialize a new application
   *
   * @constructor
   */
  constructor () {
    this._middlewares = []
    this._context = new ContextFactory()
  }

  /**
   * Use request middleware
   *
   * @param {Function} fn
   */
  use (fn) {
    assert(typeof fn === 'function', `Expect a function but got: ${typeof fn}.`)
    debug(`use middleware: ${fn.name || '<anonymous>'}`)
    this._middlewares.push(fn)
    return this
  }

  /**
   * Return a request listener
   *
   * @returns {Function}
   */
  callback () {
    var dispatch = compose(this._middlewares)

    return (req, res) => {
      var ctx = this._makeContext(req, res)

      debug(`dispatching: ${req.method} ${req.url}`)

      setImmediate(dispatch, ctx)
    }
  }

  /**
   * Extend the app context by adding per instance property
   *
   * @param {String} prop
   * @param {Function} fn
   */
  bind (prop, fn) {
    assert(typeof fn === 'function', `Expect a function but got: ${typeof fn}.`)
    debug(`set a context attribute: ${prop}`)
    this._context.bind(prop, fn)
    return this
  }

  /**
   * Extend the app context by adding shared properties
   *
   * @param {String} prop
   * @param {Any} value
   */
  set (prop, value) {
    debug(`set a shared context attribute: ${prop}`)
    this._context.set(prop, value)
    return this
  }

  /**
   * Get a value from the app context
   *
   * @param {String} prop
   */
  get (prop) {
    return this._context.get(prop)
  }

  /**
   * Check if the prop is defined in the app context
   *
   * @param {String} prop
   * @returns {Boolean}
   */
  has (prop) {
    return this._context.has(prop)
  }

  /**
   * Shorthand for:
   *
   *     http.createServer(app.callback()).listen(...args)
   */
  listen () {
    return createServer(this.callback()).listen(...arguments)
  }

  /**
   * Create a request context
   *
   * @param {Object} request
   * @param {Object} response
   * @returns {Object}
   */
  _makeContext (request, response) {
    var ctx = this._context.create()

    ctx.res = response
    ctx.req = request

    return ctx
  }
}
