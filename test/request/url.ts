
import 'mocha'
import * as assert from 'assert'
import { createRequest } from './_factory'

describe('ctx.url', () => {
  it('should return the pathname', () => {
    const request = createRequest({
      url: '/login?back=/dashboard'
    })

    assert.equal(request.url, '/login')
  })
})
