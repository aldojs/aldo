
import 'mocha'
import * as assert from 'assert'
import { createResponse } from './_factory'

describe('response.length', () => {
  describe('when Content-Length is defined', () => {
    it('should return a number', () => {
      let response = createResponse()

      response.set('Content-Length', '1024')

      assert.equal(response.length, 1024)
    })
  })

  describe('when `Content-Length` is not defined', () => {
    describe('and a `.body` is set', () => {
      it('should return a number', () => {
        let response = createResponse()

        response.body = 'foo'
        assert.equal(response.length, 3)

        response.body = Buffer.from('foo bar')
        assert.equal(response.length, 7)

        response.body = { hello: 'world' }
        assert.equal(response.length, 17)

        response.body = null
        assert(isNaN(response.length))
      })
    })

    describe('and `.body` is not set', () => {
      it('should return `NaN`', () => {
        let response = createResponse()

        assert(isNaN(response.length))
      })
    })
  })
})
