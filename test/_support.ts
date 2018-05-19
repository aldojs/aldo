
import * as sinon from 'sinon'
import { Context } from '../src'
import { ContextFactory } from 'aldo-context'

export function createAppContext () {
  return new ContextFactory<Context>()
}
