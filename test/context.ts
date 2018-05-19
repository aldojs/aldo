
import * as sinon from 'sinon'
import * as assert from 'assert'
import { describe, it } from 'mocha'
import { Application } from '../src'
import { createAppContext } from './_support'

describe('Context management', () => {
  describe('app.set(key, value)', () => {
    it('should set the context attribute', () => {
      let context = createAppContext()
      let app = new Application(context)
      let stub = sinon.stub(context, 'set')

      app.set('foo', 123)

      assert(stub.calledOnceWith('foo', 123))
    })
  })

  describe('app.get(key)', () => {
    it('should get the attribute value', () => {
      let context = createAppContext()
      let app = new Application(context)
      let stub = sinon.stub(context, 'get')

      stub.withArgs('foo').returns('bar')

      assert.equal(app.get('foo'), 'bar')
    })
  })

  describe('app.has(key)', () => {
    it('should return a `boolean`', () => {
      let context = createAppContext()
      let app = new Application(context)
      let stub = sinon.stub(context, 'has')

      stub.withArgs('foo').returns(true)

      assert(app.has('foo'))
      assert(!app.has('bar'))
    })
  })

  describe('app.bind(key, getter)', () => {
    it('should accept only functions as getter', () => {
      let context = createAppContext()
      let app = new Application(context)

      assert.throws(() => {
        app.bind('foo', undefined as any)
      })

      assert.throws(() => {
        app.bind('foo', 123 as any)
      })

      assert.throws(() => {
        app.bind('foo', {} as any)
      })

      assert.doesNotThrow(() => {
        app.bind('foo', () => 123)
      })
    })

    it('should set the property', () => {
      let context = createAppContext()
      let app = new Application(context)

      app.bind('foo', () => 'bar')

      assert(app.has('foo'))
    })
  })
})
