
import * as sinon from 'sinon'
import * as assert from 'assert'
import { describe, it } from 'mocha'
import { createContainer, NOOP, createDispatcher } from '../_support'

describe('test the middleware dispatcher', () => {
  describe('dispatcher.use(fn)', () => {
    it('should push the middleware in the stack', () => {
      let stack = new Array()
      let dispatcher = createDispatcher(stack)

      dispatcher.use(NOOP)

      assert.equal(stack.length, 1)
      assert.equal(stack[0], NOOP)
    })
  })

  describe('dispatcher.dispatch(input)', () => {
    it('should invoke the first middleware', () => {
      let context = {}
      let dispatcher = createDispatcher()
      let stub = sinon.stub(dispatcher, '_invoke' as any)

      dispatcher.dispatch(context)

      assert.ok(stub.calledOnceWithExactly(0, context))
    })

    it('should return the middleware output', () => {
      let dispatcher = createDispatcher([
        (_: any, next: any) => next(),
        () => 'foo',
        () => 'bar'
      ])

      assert.equal(dispatcher.dispatch({}), 'foo')
    })

    it('should throw the error', () => {
      let dispatcher = createDispatcher([
        (_: any, next: any) => next(),
        () => { throw new Error('KO') },
        () => 'foobar'
      ])

      assert.throws(() => dispatcher.dispatch({}))
    })
  })
})
