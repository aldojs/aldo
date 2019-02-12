
'use strict'

const { Application } = require('./application')
const { createContainer } = require('@aldojs/container')
const { createDispatcher } = require('@aldojs/middleware')


/**
 * 
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
exports.createApplication = function (dispatcher = createDispatcher(), container = createContainer()) {
  return new Application(dispatcher, container)
}
