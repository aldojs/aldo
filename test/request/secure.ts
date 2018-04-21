
import 'mocha'
import * as assert from 'assert'
import { createRequest } from './_factory'

describe('request.secure', () => {
  it('should return true when encrypted', () => {
    const request = createRequest({
      connection: {
        encrypted: true
      }
    })

    assert.equal(request.secure, true)
  })
})
