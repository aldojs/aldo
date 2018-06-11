
import * as sinon from 'sinon'
import * as assert from 'assert'
import { describe, it } from 'mocha'
import { createApplication, NOOP, createDispatcher } from '../_support'

describe('application.use(fn)', () => {
  it('should accept only functions', () => {
    let app = createApplication()

    assert.throws(() => app.use(234 as any))
    assert.throws(() => app.use(null as any))
    assert.throws(() => app.use('foo' as any))
    assert.throws(() => app.use(undefined as any))

    assert.doesNotThrow(() => app.use(NOOP))
  })

  it('should return the app instance for chaining', () => {
    let app = createApplication()

    assert.strictEqual(app.use(NOOP), app)
  })

  it("should call the dispatcher's `use` method", () => {
    let dispatcher = createDispatcher()
    let app = createApplication({ dispatcher })
    let stub = sinon.stub(dispatcher, 'use')

    app.use(NOOP)

    assert(stub.calledOnceWith(NOOP))
  })
})
