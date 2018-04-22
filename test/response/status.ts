
import 'mocha'
import * as assert from 'assert'
import { createResponse } from './_factory'

describe('response.status=', () => {
  it('should set the code', () => {
    let response = createResponse()

    response.status = 500

    assert.equal(response.status, 500)
  })

  it('should set the status message', () => {
    let response = createResponse()

    response.status = 200

    assert.equal(response.message, 'OK')
  })

  describe('when empty responses code', () => {
    it('should clear the response body', () => {
      let response = createResponse()

      response.body = 'cleared'
      response.status = 204

      assert.equal(response.body, null)
    })
  })

  describe('when an non numeric status code is given', () => {
    it('should throw', () => {
      let response = createResponse()

      assert.throws(() => {
        response.status = null as any
      })
    })
  })

  describe('when an out of range status code is provided', () => {
    it('should throw', () => {
      let response = createResponse()

      assert.throws(() => {
        response.status = 1234
      })
    })
  })
})
