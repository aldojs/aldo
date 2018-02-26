
`Aldo` is yet another library to build Node.js web applications. it's goal is to provide a secure and solid foundation for your projects, a fast execution and a fluent API.

It uses the best parts of `Koa`, `Express` and `Fastify` to make building restful applications fun and easy.

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
The request handling logic is similar to the `try..catch..finally` standard JavaScript block.
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
let db = require('./services/database')
app.set('mongo', db)

// set a per request property
// this time a function is passed to lazily get the value
// In this case, each context instance has a distinct `session` property
app.set('session', () => new Session())
```

`app.has(key)` and `app.get(key)` are also available to check the existence of a certain field, or the to get a previously defined property.

## To be continued...
