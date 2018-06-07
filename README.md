
`Aldo`'s core application is an object containing a stack of [middleware](#middlewares) functions which are  executed upon each HTTP request.

```js
const { Application } = require('aldo-application')

const app = new Application()

// add a request handler
app.use(() => 'Hello world!')

// handle the incoming request
await app.handle({ url: '/', method: 'GET' })
```

## Middlewares

Middlewares could be a common or an async function.
Each function receives a [request context](#context) and a `next` function to call the downstream middlewares, and must return a [resposne](#response) as output.

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
- `request` refers to the incoming request object
- Other fields defined with `.set(key, value)` or `.bind(key, factory)`

```ts
declare interface Context {
  request: Request;
  response: ResponseFactory;
  [key: string]: any;
}
```

To extend the request context, and add shared values (or services), like a DB connection or a global logger, you may use `.set(key, value)`

```js
const mongoose = require('mongoose')

await mongoose.connect('mongodb://localhost/test')

app.set('db', mongoose)
```

To set per request lazy properties, you may use `.bind(key, fn)`.
This method takes a field name, and a function to be used as a `factory` of the field value.

```js
app.bind('session', () => new Session(options))
```

This method is very useful, since it allows you to lazily (only when needed) attach a per request property into the context without adding a dedicated handler.

`.has(key)` and `.get(key)` are aldo available to check the existence of a certain field or to get a previously defined field value.

## Response

The middleware output could be:
- `strings` or `buffers` are sent directly,
- `streams` which will be piped to the outgoing response,
- `null` or `undefind` as empty responses (By default with 204 status code),
- otherwise, any other value will be serialized as `JSON`, with the proper `Content-Type` and `Content-Length` headers.
