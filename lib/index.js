
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
 */
exports.createApplication = function (fns = [], container = new Map()) {
  return new Application(fns, container)
}
