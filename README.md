
`Aldo` is yet another library to build Node.js web applications.
It uses the best parts of `Koa` and `Express` to provide a fast engine for your web projects.

## Installation
```bash
npm add aldo
```

## Testing
```bash
npm test
```
> More tests are comming in the future

## Hello world!
```js
// import the needed parts
const { Application, Router } = require('aldo')

const router = new Router()
const app = new Application()

// we define a `hello world` route
router.get('/', () => 'Hello world!')

// we add the router to be used by our application
app.use(router)

// we serve the application,
// which creates and uses an internal HTTP server
app.serve(3000)
```

## Application lifecycle
The request handling logic is similar to the `try..catch..finally` JavaScript block.
In other words, the application will try to call the route middlewares one by one then it calls the final handler.
If an error occurs, it will be handled by the error handlers before reaching the final handler which will terminate and send the response to the client.

You can use `.pre`, `.post`, `.use`, `.catch` and `.finally` methods to control the flow of request handling.

> Since each method controls a processing step, the order doesn't matter any more.

```js
const app = new Application()

// 1. The `try` block

// attach one or more global middlewares before the route
// useful to configure global services like session, cache ...etc
app.pre(...middlewares)

// use one or many routers with `.use`
app.use(...routers)
// ... etc

// attach global middlewares to be executed after the route handlers
// like saving a cached version, persisting session data, setting more headers ...etc
app.post(...middlewares)


// 2. The `catch` block

// attaching error handlers is done as below
app.catch(...middlewares)


// 3. The `finally` block

// at last, only one final handler is used
// the default one is simply sending the response
app.finally(finalHandler)
```

Like `Koa`, each `middleware` is a function with 2 arguments, the first argument is a *`context`* object and the second is a *`function`* to call the next middleware in the chain.

```ts
declare type Middleware = (ctx: Context, next: (err?: any) => void) => void
```

## Context
The context object is not a proxy to the request and response properties, it's a simple plain object with only 3 mandatory properties `request`, `response` and `app`.
Even the error middlewares have the same signature, but with an additonal context property which the `error` value.

```ts
declare type Literal = { [x: string]: any }

declare interface Context extends Literal {
  response: Response // Response object provided by the package `aldo-http`
  request: Request   // Request object provided by the package `aldo-http`
  app: Application
  error?: any
}
```
To extend the request context, and add more properties, you can use `app.set(key, value)` or `app.bind(key, factory)`
```js
// set a global value to be available for all requests
app.set('mongo', require('./services/database'))

// set a per request property using a function to lazily get the value
// This time, each context instance has a distinct `session` property
app.bind('session', () => new Session())
```

`app.has(key)` and `app.get(key)` are also available to check the existence of a certain field, or to get a previously defined property.

## Router
Each `router` instance control an erea in the application, it acts like a routing namespace.
You can use as many routers as you need. For example, a router to manage authentication, another for the API, a private router for admin routing, and so on.

> The order of defining routes is not important any more. Thanks to [find-my-way](https://npmjs.com/find-my-way) witch is a [radix tree](https://en.wikipedia.org/wiki/Radix_tree).

```js
const { Router } = require('aldo')
const { users } = require('./controllers')

// Let's create an admin area router
// `/admin` is a URL prefix for all routes
const router = new Router('/admin')

// define a single handler for admin home page for the GET method
router.get('/', users.home)

// we can define multiple handlers per HTTP method for the same route
router
  .route('/users')
  .get(users.show)
  .delete(users.delete)
  .post(users.validate, users.add)
  .put(users.validate, users.modify)
```
Note that the last handler of any route implements the `FinalHandler` interface and doesn't have the second parameter `next` like middlewares

```ts
declare type FinalHandler = (ctx: Context) => any
```

## To be continued...
