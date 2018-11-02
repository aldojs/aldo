
import { Application } from './application'
import { createContainer } from '@aldojs/container'
import { createDispatcher } from '@aldojs/middleware'

/**
 * Create a new application instance
 * 
 * @param dispatcher 
 * @param container 
 * @public
 */
export function createApplication<T extends object> (
  dispatcher = createDispatcher<T>(),
  container = createContainer()
): Application<T> {
  return new Application<T>(dispatcher, container)
}
