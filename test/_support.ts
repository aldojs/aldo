
import { Container } from '../src/_container'
import { Dispatcher } from '../src/_dispatcher'
import { Application, ApplicationOptions } from '../src'

export function createApplication (options?: ApplicationOptions) {
  return new Application(options)
}

export function createContainer (map?: Map<string, Function>) {
  return new Container(map)
}

export function createDispatcher (stack?: Function[]) {
  return new Dispatcher(stack as any)
}

export function createRequest () {
  return { url: '/', method: 'GET' }
}

export const NOOP = () => {}
