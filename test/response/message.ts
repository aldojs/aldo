
import 'mocha'
import * as assert from 'assert'
import { createResponse } from './_factory'

describe('response status message manipulation', () => {
  describe('response.message', () => {
    it('should get the status message', () => {
      let response = createResponse()

      assert.equal(response.message, 'No Content')
    })

    it('should default to status code', () => {
      let response = createResponse()

      response.status = 200

      assert.equal(response.message, 'OK')
    })
  })

  describe('response.message=', () => {
    it('should set the status message', () => {
      let response = createResponse()

      response.message = 'OK'

      assert.equal(response.message, 'OK')
    })
  })
})
