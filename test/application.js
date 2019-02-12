
'use strict'

const assert = require('assert')
const { createApplication } = require('../lib')

const NOOP = () => {}

describe('application.use(fn)', () => {
  it('should accept only functions', () => {
    let app = createApplication()

    assert.throws(() => app.use(234))
    assert.throws(() => app.use(null))
    assert.throws(() => app.use('foo'))
    assert.throws(() => app.use(undefined))

    assert.doesNotThrow(() => app.use(NOOP))
  })

  it('should return the app instance for chaining', () => {
    let app = createApplication()

    assert.strictEqual(app.use(NOOP), app)
  })
})

describe('application.handle(context)', () =>  {
  it('should work - common functions', () => {
    let app = createApplication()

    // stack
    app.use((_, next) => next())
    app.use((_, next) => next())
    app.use(() => 'foobar')

    assert.equal(app.handle({}), 'foobar')
  })

  it('should work - async functions', async () => {
    let app = createApplication()

    // stack
    app.use(async (_, next) => next())
    app.use(async (_, next) => next())
    app.use(async () => 'foobar')

    assert.equal(await app.handle({}), 'foobar')
  })

  it('should throws', () => {
    let app = createApplication()

    // stack
    app.use((_, next) => next())

    app.use(() => {
      throw new Error('KO')
    })

    app.use((_, next) => next())

    assert.throws(() => app.handle({}))
  })
})
