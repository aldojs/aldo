
import * as assert from 'assert'
import { describe, it } from 'mocha'
import { createApplication, createRequest } from './_support'

describe('application.handle(request)', () =>  {
  it('should work - common functions', () => {
    let app = createApplication()

    // stack
    app.use((_, next) => next())
    app.use((_, next) => next())
    app.use((_, next) => 'foobar')

    assert.equal(app.handle(createRequest()), 'foobar')
  })

  it('should work - async functions', async () => {
    let app = createApplication()

    // stack
    app.use(async (_, next) => next())
    app.use(async (_, next) => next())
    app.use(async (_, next) => 'foobar')

    assert.equal(await app.handle(createRequest()), 'foobar')
  })

  it('should throws', () => {
    let app = createApplication()

    // stack
    app.use((_, next) => next())

    app.use((_, next) => {
      throw new Error('KO')
    })

    app.use((_, next) => next())

    assert.throws(() => app.handle(createRequest()))
  })
})
