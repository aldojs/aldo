
import 'mocha'
import * as assert from 'assert'
import ContextBuilder from '../src/context'

let context: ContextBuilder

describe('Test context building', () => {
  beforeEach(() => {
    context = new ContextBuilder()
  })

  describe('context.create(request)', () => {
    it('should create a context store', () => {
      let ctx = context.create(null as any)

      assert.deepEqual(ctx, { request: null })
    })
  })

  describe('context.set(key, value)', () => {
    it('should set a new property', () => {
      context.set('foo', 123)

      let ctx = context.create(null as any)

      assert.equal(ctx.foo, 123)
    })
  })

  describe('context.get(key)', () => {
    it('should return the `value` of the `key`', () => {
      context.set('foo', 123)

      assert.equal(context.get('foo'), 123)
    })

    it("should return `undefined` if the `key` doesn't exist", () => {
      assert.equal(context.get('foo'), undefined)
    })
  })

  describe('context.has(key)', () => {
    it('should return `true` if the `key` is defined', () => {
      context.set('foo', 123)

      assert(context.has('foo'))
    })

    it("should return `false` if the `key` doesn't exist", () => {
      assert(!context.has('foo'))
    })
  })

  describe('context.bind(key, fn)', () => {
    it('should set the property', () => {
      context.bind('foo', () => 'bar')

      assert(context.has('foo'))
    })

    it('should invoke the getter only once', () => {
      let i = 1

      context.bind('foo', () => i++)

      let ctx = context.create(null as any)

      assert.equal(ctx.foo, 1)
      assert.equal(ctx.foo, 1)
      assert.equal(ctx.foo, 1)
    })
  })
})
