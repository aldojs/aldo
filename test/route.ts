
import 'mocha'
import Route from '../src/route'
import * as assert from 'assert'

describe('Test Route', () => {
  describe('route.path', () => {
    it('should return the route path', () => {
      assert.equal(new Route('/foo').path, '/foo')
    })

    it('should normalize the path', () => {
      assert.equal(new Route('').path, '/')
      assert.equal(new Route('/').path, '/')
      assert.equal(new Route('///').path, '/')
      assert.equal(new Route('foo').path, '/foo')
      assert.equal(new Route('foo/').path, '/foo')
    })

    describe('when a prefix is present', () => {
      it('should start with the prefix', () => {
        var route = new Route('/bar', '/foo')

        assert.equal(route.path, '/foo/bar')
      })

      it('should normalize the path', () => {
        var route = new Route('/bar/', 'foo/')

        assert.equal(route.path, '/foo/bar')
      })
    })

    describe('when the prefix is changed', () => {
      it('should contain the new prefix', () => {
        var route = new Route('/bar')

        assert.equal(route.path, '/bar')

        route.prefix('/foo')

        assert.equal(route.path, '/foo/bar')
      })
    })
  })

  describe('route.head(...fns)', () => {
    it('should add handlers for HEAD method', () => {
      var route = new Route('/')

      route.head(() => {}, () => {})

      var [method, handlers] = route.handlers()[0]

      assert.equal(method, 'HEAD')
      assert.equal(handlers.length, 2)
      assert(typeof handlers[0] === 'function')
      assert(typeof handlers[1] === 'function')
    })
  })

  describe('route.post(...fns)', () => {
    it('should add handlers for POST method', () => {
      var route = new Route('/')

      route.post(() => {}, () => {})

      var [method, handlers] = route.handlers()[0]

      assert.equal(method, 'POST')
      assert.equal(handlers.length, 2)
      assert(typeof handlers[0] === 'function')
      assert(typeof handlers[1] === 'function')
    })
  })

  describe('route.put(...fns)', () => {
    it('should add handlers for PUT method', () => {
      var route = new Route('/')

      route.put(() => {}, () => {})

      var [method, handlers] = route.handlers()[0]

      assert.equal(method, 'PUT')
      assert.equal(handlers.length, 2)
      assert(typeof handlers[0] === 'function')
      assert(typeof handlers[1] === 'function')
    })
  })

  describe('route.patch(...fns)', () => {
    it('should add handlers for PATCH method', () => {
      var route = new Route('/')

      route.patch(() => {}, () => {})

      var [method, handlers] = route.handlers()[0]

      assert.equal(method, 'PATCH')
      assert.equal(handlers.length, 2)
      assert(typeof handlers[0] === 'function')
      assert(typeof handlers[1] === 'function')
    })
  })

  describe('route.options(...fns)', () => {
    it('should add handlers for OPTIONS method', () => {
      var route = new Route('/')

      route.options(() => {}, () => {})

      var [method, handlers] = route.handlers()[0]

      assert.equal(method, 'OPTIONS')
      assert.equal(handlers.length, 2)
      assert(typeof handlers[0] === 'function')
      assert(typeof handlers[1] === 'function')
    })
  })

  describe('route.delete(...fns)', () => {
    it('should add handlers for DELETE method', () => {
      var route = new Route('/')

      route.delete(() => {}, () => {})

      var [method, handlers] = route.handlers()[0]

      assert.equal(method, 'DELETE')
      assert.equal(handlers.length, 2)
      assert(typeof handlers[0] === 'function')
      assert(typeof handlers[1] === 'function')
    })
  })

  describe('route.get(...fns)', () => {
    it('should add handlers for HEAD and GET methods', () => {
      var route = new Route('/')

      route.get(() => {}, () => {})

      var [method, handlers] = route.handlers()[0]

      assert.equal(method, 'HEAD')
      assert.equal(handlers.length, 2)
      assert(typeof handlers[0] === 'function')
      assert(typeof handlers[1] === 'function')

      ;[method, handlers] = route.handlers()[1]

      assert.equal(method, 'GET')
      assert.equal(handlers.length, 2)
      assert(typeof handlers[0] === 'function')
      assert(typeof handlers[1] === 'function')
    })
  })

  describe('route.any(methods, ...fns)', () => {
    it('should attach handlers to the method', () => {
      var route = new Route('foo')
      var handler1 = () => {}
      var handler2 = () => {}

      route.any(['HEAD'], handler1, handler2)

      var [method, handlers] = route.handlers()[0]

      assert.equal(method, 'HEAD')
      assert.equal(handlers.length, 2)
      assert.equal(handlers[0], handler1)
    })

    it('should attach handlers to multiple methods', () => {
      var route = new Route('foo')
      var handler1 = () => {}
      var handler2 = () => {}

      route.any(['HEAD', 'GET'], handler1, handler2)

      var [method, handlers] = route.handlers()[0]

      assert.equal(method, 'HEAD')
      assert.equal(handlers.length, 2)
      assert.equal(handlers[0], handler1)

      ;[method, handlers] = route.handlers()[1]

      assert.equal(method, 'GET')
      assert.equal(handlers.length, 2)
      assert.equal(handlers[0], handler1)
    })

    it('should wrap the last handler', () => {
      var route = new Route('/')
      var handler1 = () => {}
      var handler2 = () => {}

      route.any(['PUT'], handler1, handler2)

      var [method, handlers] = route.handlers()[0]

      assert.equal(method, 'PUT')
      assert.equal(handlers.length, 2)
      assert.equal(handlers[0], handler1)
      assert.notEqual(handlers[1], handler2)
    })

    it('should throw if no handler was provided', () => {
      var route = new Route('/')

      assert.throws(() => route.any(['POST']))
    })

    it('should throw if a given handler is not a function', () => {
      var route = new Route('/')

      assert.throws(() => route.any(['OPTIONS'], 123 as any))
    })

    it('should throw if the given method is not accepted', () => {
      var route = new Route('/')

      assert.throws(() => route.any(['FOO'], () => {}))
    })

    it('should throw if a method is used twice', () => {
      var route = new Route('/')

      assert.throws(() => route.any(['GET', 'GET'], () => {}))
    })
  })
})
