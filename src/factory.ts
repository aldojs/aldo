
import { createContainer } from '@aldojs/container'
import { Application, Context } from './application'
import { createDispatcher } from '@aldojs/middleware'

/**
 * Create a new application instance
 * 
 * @param dispatcher 
 * @param container 
 * @public
 */
export function createApplication<T extends Context> (
  dispatcher = createDispatcher<T>(),
  container = createContainer()
): Application<T> {
  return new Application<T>(dispatcher, container)
}
