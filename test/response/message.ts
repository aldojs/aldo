
import 'mocha'
import * as assert from 'assert'
import { createResponse } from './_factory'

describe('response status message manipulation', () => {
  describe('response.message', () => {
    it('should get the status message', () => {
      let response = createResponse()

      assert.equal(response.statusMessage, 'No Content')
    })

    it('should default to status code', () => {
      let response = createResponse()

      response.status(200)

      assert.equal(response.statusMessage, 'OK')
    })
  })
})
