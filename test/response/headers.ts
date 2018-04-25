
import 'mocha'
import * as assert from 'assert'
import { createResponse } from './_factory'

describe('response headers manipulation', () => {
  describe('response.headers', () => {
    it('should return the response header object', () => {
      let response = createResponse()

      assert.deepEqual(response.headers, {})
    })
  })

  describe('response.has(header)', () => {
    it('should return a boolean', () => {
      let response = createResponse()

      response.set({
        'foo': 'foo',
        'buzz': 'buzz'
      })

      assert.equal(response.has('FOO'), true)
      assert.equal(response.has('Foo'), true)
      assert.equal(response.has('bar'), false)
      assert.equal(response.has('buzz'), true)
      assert.equal(response.has('bUSY'), false)
    })
  })

  describe('response.get(name)', () => {
    it('should return the field value', () => {
      let response = createResponse()

      response.set('X-Foo', 'bar')

      assert(response.get('X-Foo'), 'bar')
    })

    describe('when the header is not present', () => {
      it('should return `undefined`', () => {
        let response = createResponse()
  
        assert.equal(response.get('x-foo'), undefined)
      })
    })
  })

  describe('response.set(name, value)', () => {
    it('should set a field value', () => {
      let response = createResponse()

      response.set('Foo', 'bar')

      assert.equal(response.headers.foo, 'bar')
    })

    it('should set a field value of array', () => {
      let response = createResponse()

      response.set('X-Foo', ['bar', 'baz'])

      assert.deepEqual(response.headers['x-foo'], ['bar', 'baz'])
    })

    it('should set multiple fields', () => {
      let response = createResponse()

      response.set({
        'foo': 1,
        'bar': 2
      })

      assert.equal(response.headers['foo'], 1)
      assert.equal(response.headers['bar'], 2)
    })

    it('should override the value of an existing field', () => {
      let response = createResponse()

      response.set('Foo', 'bar')
      response.set('Foo', 'baz')

      assert.equal(response.headers['foo'], 'baz')
    })
  })

  describe('response.reset()', () => {
    it('should remove all fields', () => {
      let response = createResponse()

      response.set({ 'foo': 1, 'bar': 2 })

      assert.deepEqual(response.headers, { 'foo': 1, 'bar': 2 })

      response.reset()

      assert.deepEqual(response.headers, {})
    })

    describe('when an object is given', () => {
      it('should reset the headers with the new values', () => {
        let response = createResponse()

        response.set({ 'foo': 1 })
  
        response.reset({ 'bar': 2 })
  
        assert.deepEqual(response.headers, { 'bar': 2 })
      })
    })
  })

  describe('response.remove(name)', () => {
    it('should remove a field', () => {
      let response = createResponse()

      response.set({ 'foo': 'bar' })

      response.remove('Foo') // case insensitive

      assert.equal(response.get('foo'), undefined)
    })
  })

  describe('response.append(name, val)', () => {
    it('should append multiple headers', () => {
      let response = createResponse()

      response.append('x-foo', 'bar1')
      response.append('x-foo', 'bar2')

      assert.deepEqual(response.get('x-foo'), ['bar1', 'bar2'])
    })

    it('should accept array of values', () => {
      let response = createResponse()

      response.append('Set-Cookie', ['foo=bar', 'fizz=buzz'])
      response.append('Set-Cookie', 'hi=again')

      assert.deepEqual(response.get('set-cookie'), ['foo=bar', 'fizz=buzz', 'hi=again'])
    })

    it('should get reset by response.set(field, val)', () => {
      let response = createResponse()

      response.append('Link', '<http://localhost:80/>')
      response.append('Link', '<http://localhost/>')
      response.set('Link', '<http://127.0.0.1/>')

      assert.equal(response.get('link'), '<http://127.0.0.1/>')
    })

    it('should work with response.set(field, val) first', () => {
      let response = createResponse()

      response.set('Link', '<http://localhost/>')
      response.append('Link', '<http://localhost:80/>')

      assert.deepEqual(response.get('link'), ['<http://localhost/>', '<http://localhost:80/>'])
    })
  })
})