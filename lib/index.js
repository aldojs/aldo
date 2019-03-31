
'use strict'

const { Application } = require('./application')


/**
 * Application class
 * 
 * @class
 */
exports.Application = Application

/**
 * Initialize a new application
 * 
 * @param {Function[]} fns 
 * @param {Map<string | symbol, any>} container 
 * @throws if `fns` is not a valid array of middlewares.
 */
exports.createApplication = function (fns = [], container = new Map()) {
  if (! Array.isArray(fns)) {
    throw new TypeError(`Expect an array, but got "${typeof fns}"`)
  }

  for (let fn of fns) {
    if (typeof fn !== 'function') {
      throw new TypeError(`Expect a function, but got "${typeof fn}"`)
    }
  }

  return new Application(fns, container)
}
