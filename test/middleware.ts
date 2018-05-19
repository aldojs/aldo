
import * as assert from 'assert'
import { describe, it } from 'mocha'
import { Application } from '../src'

describe('Middleware management', () =>  {
  it('should work', async () => {
    let app = new Application()

    // stack
    app.use((_, next) => next())
    app.use((_, next) => next())
    app.use((_, next) => 'foobar')

    let handle = app.callback()

    assert.equal(await handle({} as any), 'foobar')
  })
})
