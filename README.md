
A generic application which uses internally a service container and a middleware dispatcher to handle any context object.

```js
import { createApplication } from '@aldojs/application'

let app = createApplication()

// add a sum handler
app.use(({ a, b }) => a + b)

// handle the context
let result = app.handle({ a: 1, b: -1 })
```

## Middlewares

Middlewares could be a common or an async function. please refer to [@aldojs/middleware](https://www.npmjs.org/package/@aldojs/middleware) for more information on how middlewares are dispatched.

```ts
// Handler function signature
declare type Middleware = (ctx: Context, next: () => any) => any;
```

You can register as many middlewares as needed with the application's method `.use(fn)`.

```js
// to add a handler directly in the stack
app.use(middleware)
```

Whether a middleware runs before or after a downstream middlewares depends on the middleware itself.
For example, the following middleware would perform some task before the others

```js
app.use((context, next) => {
  // Perform task

  return next()
})
```

However, this one would perform its task after the context is handled by the following middlewares.

```js
app.use(async (context, next) => {
  let result = await next()

  // Perform task

  return result
})
```

## Context

The context is a proxy object of the original object given to `.handle()` method.
It provides the same fields, in addition to the properties defined with `.set(key, value)` or `.bind(key, factory)` methods.

```ts
declare interface Context {
  [key: string]: any;
}
```

You may use `.set(key, instance)` to share instances between contexts, like a DB connection or a global logger.

```js
import Mongoose from 'mongoose'

// configure the mongo db connection

app.set('db', connection)
```

You may also use `.bind(key, fn)` to bind per-context instances.
This method takes the field name, and the `factory` function to create the service object.

```js
app.bind('session', () => new Session(options))
```

`.has(key)` and `.get(key)` are aldo available to check the existence of a certain service or to get a previously defined one.
