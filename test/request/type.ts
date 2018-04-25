
import 'mocha'
import * as assert from 'assert'
import { createRequest } from './_factory'

describe('request.type', () => {
  it('should return type void of parameters', () => {
    const request = createRequest({
      headers: {
        'content-type': 'text/html; charset=utf-8'
      }
    })

    assert.equal(request.type, 'text/html')
  })

  it('with no type present', () => {
    const request = createRequest()

    assert.equal(request.type, undefined)
  })
})