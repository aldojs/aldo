
`Aldo-application` is an object containing a stack of [middleware](#middlewares) functions which are composed and executed upon each HTTP request.

```js
const { Application } = require('aldo')

const app = new Application()

// add a request handler
app.use(() => 'Hello world!')

// create a HTTP server to serve the application
app.start(process.env.PORT)
```

## Middlewares

Middlewares could be a common or an async function.
Each function receives a [request context](#context) and a `next` function to call the downstream middlewares, and must return a [response](#response) as output.

```ts
// Handler function signature
declare type Middleware = (ctx: Context, next: () => any) => any;
```

You can register as many middlewares as needed with the application's method `.use(fn)`

```js
// to add a handler directly in the stack
app.use(middleware)
```

Whether a middleware runs before or after a downstream middlewares depends on the middleware itself.
For example, the following middleware would perform some task before the others

```js
app.use((ctx, next) => {
  // Perform task

  return next()
})
```

However, this middleware would perform its task after the request is handled by the following middlewares

```js
app.use(async (ctx, next) => {
  let response = await next()

  // Perform task

  return response
})
```

## Context

The context object is a simple plain object with these properties:
- `request` refers to the request object from `aldo-http` module
- `response` function to get a new `Response` instance each time called
- Other fields defined with `.set(key, value)` or `.bind(key, getter)`

```ts
declare interface Context {
  request: Request;
  response: ResponseFactory;
  [key: string]: any;
}
```

To extend the request context, and add shared properties, like a DB connection or a global logger, you may use `.set(key, value)`

```js
const mongoose = require('mongoose')

await mongoose.connect('mongodb://localhost/test')

app.set('db', mongoose)
```

To set a per request private properties, you may use `.bind(key, getter)`. This method takes a field name, and a function to be used as a `lazy` getter of the field value.

```js
app.bind('session', () => new Session(options))
```

This method is very useful, since it allows you to lazily (only when needed) attach a per request property into the context without adding a dedicated handler.

`.has(key)` and `.get(key)` are aldo available to check the existence of a certain field or to get a previously defined field value.

## Response

The middleware output could be:
- `strings` or `buffers` sent directly
- `streams` which will be piped to the outgoing response
- `null` or `undefind` as empty responses (By default with 204 status code)
- `Response` instances which can be created with the context `response` property
- otherwise, any other value will be serialized as `JSON`, with the proper `Content-Type` and `Content-Length`
