
import 'mocha'
import * as assert from 'assert'
import { createRequest } from './_factory'

describe('ctx.origin', () => {
  it('should return the origin of url', () => {
    const request = createRequest({
      url: '/users/1?back=/dashboard',
      headers: {
        host: 'localhost'
      },
      connection: {}
    })

    assert.equal(request.origin, 'http://localhost')
  })
})
