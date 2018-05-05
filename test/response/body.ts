
import 'mocha'
import * as assert from 'assert'
import { createResponse } from './_factory'

describe('response.body=', () => {
  it('should set the status code to 200', () => {
    let response = createResponse()

    response.status(100)
    response.body = 'hello'

    assert.equal(response.statusCode, 200)
  })

  describe('when a `Content-Type` is already set', () => {
    it('should not override the type', () => {
      let response = createResponse()

      response.type('text')
      response.body = '<p>Hello</p>'

      assert.equal(response.get('Content-Type'), 'text/plain; charset=utf-8')
    })

    it('should not override it when the body is an object', () => {
      let response = createResponse()

      response.type('application/foo.bar+json')
      response.body = { 'foo': 'bar' }

      assert.equal(response.get('Content-Type'), 'application/foo.bar+json')
    })
  })

  describe.skip('when the body is a string', () => {
    it('should default to text', () => {
      let response = createResponse()

      response.body = 'Hello world!'

      assert.equal(response.get('Content-Type'), 'text/plain; charset=utf-8')
    })
  })

  describe.skip('when the body is html', () => {
    it('should default to html', () => {
      const response = createResponse()

      response.body = '<h1>Tobi</h1>'

      assert.equal(response.get('content-type'), 'text/html; charset=utf-8')
    })
  })

  describe.skip('when the body is a buffer', () => {
    it('should default to an octet stream', () => {
      let response = createResponse()

      response.body = Buffer.from('Hello')

      assert.equal(response.get('Content-Type'), 'application/octet-stream')
    })
  })

  describe.skip('when an object is given', () => {
    it('should default to json', () => {
      let response = createResponse()

      response.body = { foo: 'bar' }

      assert.equal(response.get('Content-Type'), 'application/json; charset=utf-8')
    })
  })
})
