
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

## Context

The context is a plain object, containing all data needed by the middlewares to do their job.
A proxied version is passed to the middleware chain, instead of the original context object, to provide the same fields, in addition to the properties defined with `.set(key, value)` or `.bind(key, factory)` methods. In other, you can access the services registered within the application, directly in the middlewares

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
app.set('db', connection)
```

You may also use `.bind(key, fn)` to bind per-context instances.
This method takes the field name, and the `factory` function to create the service object on demand.

```js
let options = {/* some session options */}

// a new instance of Session is `lazily` created for each context
app.bind('session', () => new Session(options))
```

`.has(key)` and `.get(key)` are aldo available to check the existence of a certain service or to get a previously defined one.
