
import * as assert from 'assert'
import { describe, it } from 'mocha'
import { createContainer, NOOP } from '../_support'

describe('test the factory container', () => {
  describe('container.set(name, fn)', () => {
    it('should set an item in the map', () => {
      let map = new Map()
      let container = createContainer(map)

      container.set('foo', NOOP)

      assert.equal(map.get('foo'), NOOP)
      assert.ok(container.has('foo'))
      assert.equal(map.size, 1)
      assert(map.has('foo'))
    })
  })

  describe('container.get(name, arg)', () => {
    it('should receive the context', () => {
      let container = createContainer()
      let context = {}
      
      container.set('foo', (ctx) => {
        assert.deepEqual(ctx, context)
        return 'bar'
      })

      container.get('foo', context)
    })

    it('should return the factory output', () => {
      let container = createContainer()

      container.set('foo', () => 'bar')

      assert.equal(container.get('foo', {}), 'bar')
    })
  })
})
