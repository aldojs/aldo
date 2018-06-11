
import { Dispatcher } from '../../src/_dispatcher'
import { Application, IDispatcher } from '../../src'

export function createApplication (dispatcher?: IDispatcher) {
  return new Application(dispatcher)
}

export function createDispatcher () {
  return new Dispatcher()
}

export const NOOP = () => {}
