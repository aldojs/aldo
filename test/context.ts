
import 'mocha'
import * as assert from 'assert'
import ContextFactory from '../src/context'

let factory

describe('Test context factory', () => {
  beforeEach(() => {
    factory = new ContextFactory()
  })

  describe('factory.from(req, res)', () => {
    it('should create a context store', () => {
      let ctx = factory.from({}, {})

      assert.deepEqual(ctx, { req: {}, res: {} })
    })
  })

  describe('factory.set(key, value)', () => {
    it('should set a new property', () => {
      factory.set('foo', 123)

      let ctx = factory.from(true, false)

      assert.equal(ctx.foo, 123)
    })
  })

  describe('factory.get(key)', () => {
    it('should return the `value` of the `key`', () => {
      factory.set('foo', 123)

      assert.equal(factory.get('foo'), 123)
    })

    it("should return `undefined` if the `key` doesn't exist", () => {
      assert.equal(factory.get('foo'), undefined)
    })
  })

  describe('factory.has(key)', () => {
    it('should return `true` if the `key` is defined', () => {
      factory.set('foo', 123)

      assert(factory.has('foo'))
    })

    it("should return `false` if the `key` doesn't exist", () => {
      assert(!factory.has('foo'))
    })
  })

  describe('factory.bind(key, fn)', () => {
    it('should set the property', () => {
      factory.bind('foo', () => 'bar')

      assert(factory.has('foo'))
    })

    it('should invoke the factory only once', () => {
      let i = 1

      factory.bind('foo', () => i++)

      let ctx = factory.from({}, {})

      assert.equal(ctx.foo, 1)
      assert.equal(ctx.foo, 1)
      assert.equal(ctx.foo, 1)
    })
  })
})
