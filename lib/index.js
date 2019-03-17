
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
 * @param {Dispatcher} dispatcher 
 * @param {Container} container 
 */
exports.createApplication = function (dispatcher, container = new Map()) {
  return new Application(dispatcher, container)
}
