
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
app.pre(middleware)

// use one or many routers with `.use`
app.use(router)
// ... etc

// attach global middlewares to be executed after the route handlers
// like saving a cached version, persisting session data, setting more headers ...etc
app.post(middleware)


// 2. The `catch` block

// attaching error handlers is done as below
app.catch(middleware)


// 3. The `finally` block

// at last, only one final handler is used
// the default one is simply sending the response
app.finally(finalHandler)
```

Like `Koa`, each `middleware` is a function with 2 arguments, the first argument is a *`context`* object and the second is a *`function`* to call the next middleware in the chain.

```ts
declare type Middleware = (ctx: Context, next: (err?) => void) => void
```

## Context
The context object is not a proxy to the request and response properties, it's a simple plain object with only 3 mandatory properties `request`, `response` and `app`.

```ts
declare interface Context {
  response: Response // Response object provided by the package `aldo-http`
  request: Request   // Request object provided by the package `aldo-http`
  app: Application
  [x: string]: any
}
```
To extend the request context, and add more properties, you can use `app.set(key, value)`
```js
// set a global value to be available for all requests
app.set('mongo', require('./services/database'))

// set a per request property using a function to lazily get the value
// This time, each context instance has a distinct `session` property
app.set('session', () => new Session())
```

`app.has(key)` and `app.get(key)` are also available to check the existence of a certain field, or to get a previously defined property.

## Router
Each `router` instance control an erea in the application, it acts like a routing namespace.
You can use as many routers as you need. For example, a router to manage authentication, another for the API, a private router for admin routing, and so on.

```js
const { Router } = require('aldo')

// Let's create an admin area router
// `/admin` is a URL prefix for all routes
const router = new Router('/admin')

// define a single handler for admin home page for the GET method
router.get('/', controller.showDashboard)

// we can define multiple handlers per HTTP method for the same route
router
  .route('/users')
  .get(controller.showUsers)
  .delete(controller.deleteUser)
  .post(validate, controller.addUser)
  .put(validate, controller.modifyUser)
```

> The order of defining routes is not important any more. Thanks to the package [find-my-way](https://npmjs.com/find-my-way) witch is a [radix tree](https://en.wikipedia.org/wiki/Radix_tree).

## To be continued...
