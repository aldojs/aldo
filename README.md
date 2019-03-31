
A generic application to dispatch a context object over a chained list of middlewares.

```js
import { createApplication } from '@aldojs/application'

let app = createApplication()

// use a middleware
app.use((handle) => async (ctx) => {
  let result = await handle(ctx)

  return result * 2
})

// add a sum handler
app.setHandler(({ a, b }) => a + b)

// dispatch the context to handlers
let result = app.dispatch({ a: 1, b: -2 })
```

## Middlewares

Middlewares could be a common or an async function. please refer to [@aldojs/middleware](https://www.npmjs.org/package/@aldojs/middleware) for more information on how middlewares are dispatched.

```ts
declare type Handler = (ctx: Context) => any;

declare type Middleware = (next: Handler) => Handler;
```

You can register as many middlewares as needed with the application's method `.use(fn)`.

```js
// to add a handler directly in the stack
app.use(middleware)
```

At the end, you have to register the last and default handler of the context.

```js
app.setHandler(fn);
```

## Context

The context is a plain object, containing all data needed by the handlers to do their job.
A proxied version is passed to the middleware chain, instead of the original context object, to provide the same fields, in addition to the properties defined with `Application::set(key, value)`. In other words, you can access the services registered within the application, directly in the middlewares within the context object.

```ts
declare interface Context {
  [key: string]: any;
}
```

You may use `Application::set(key, instance)` to share instances between contexts, like a DB connection or a global logger.

```js
import Mongoose from 'mongoose'

// set up the mongon db connection
// let connection = ...

// register it within the context
app.set('db', connection);

// you can access to the DB connection within the context
app.setHandler(async ({ db }) => {
  let users = await db.fetchUsers()

  // ...
})
```

`.has(key)` and `.get(key)` are aldo available to check the existence of a certain service or to get a previously defined one.
