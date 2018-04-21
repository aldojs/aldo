
import 'mocha'
import * as assert from 'assert'
import { createRequest } from './_factory'

describe('req.ip', () => {
  describe('with req.ips present', () => {
    it('should return req.ips[0]', () => {
      const request = createRequest({
        headers: {
          'x-forwarded-for': '127.0.0.1'
        },
        connection: {
          remoteAddress: '127.0.0.2'
        }
      }, { proxy: true })

      assert.equal(request.ip, '127.0.0.1')
    })
  })

  describe('with no req.ips present', () => {
    it('should return req.stream.connection.remoteAddress', () => {
      const request = createRequest({
        headers: {
          'x-forwarded-for': '127.0.0.1'
        },
        connection: {
          remoteAddress: '127.0.0.2'
        }
      })

      assert.equal(request.ip, '127.0.0.2')
    })

    describe('with req.stream.connection.remoteAddress not present', () => {
      it('should return an empty string', () => {
        assert.equal(createRequest({ connection: {} }).ip, undefined)
      })
    })
  })
})
