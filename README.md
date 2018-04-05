
> This project is under heavy development, and the API is unstable and may change frequently.

`Aldo` is a micro framework that helps you quickly write simple yet powerful web applications and APIs for Node.js 8+.
It is super fast and has very little code.
In fact, you can read and understand its source code in only an afternoon!

At its core, `Aldo` is a dispatcher that invokes a serial callback stack to handle the incoming HTTP request. That’s it.

```js
const { Application } = require('aldo')

const app = new Application()

// add the first handler
app.use(({ res }) => {
  res.setHeader('Content-Type', 'text/plain')
  res.end('Hello world!')
})

// create a HTTP server to serve the application
app.listen(3000)
```

## Handlers (aka middlewares)
Unlike the other web frameworks, `Aldo` uses handlers that take only **one** argument "the [*context*](#context)", which is a literal object holding everything you need to handle the incoming HTTP request.

When the current handler has finished its job, the [context](#context) object is passed automatically to the next handler, and so on, till the last one.

To break this chain, just return `false` or `Promise<false>`.

```ts
// Handler function signature
declare type Handler = (ctx: Context) => any;
```

You may be wondering, where is the `next` argument ?
`Aldo` doesn't provide it, only the [context](#context) is given.
The `next` function is invoked internally after the current handler has finished.

```js
// the `next` function is called immediately after a sync handler
app.use(({ req: { url, method } }) => {
  console.log(`incoming request: ${method} ${url}`)
})

// the `next` function is awaiting async functions
app.use(async (ctx) => {
  await fetch('some data from the DB')
})

// the `next` function is also awaiting sync functions returning promises
app.use((ctx) => {
  return fetch('some data from the DB')
})
```

### Request handlers
Request handlers are invoked for every incoming HTTP request.
You may add handlers with the application instance’s `.use(...fns)` method.

```js
// will attach one or more global handlers
app.use(...handlers)
```

### Error handlers
You may attach error handlers as many as needed with `.catch(...fns)`.

```js
app.catch(...handlers)
```

When an error is thrown, during the request handling, will be attached to the [context](#context) object and passed to each handler one by one, unless you return a `false` which will stop the error handling sequence.

## Context
The context object is not a proxy to the request and response properties, it's a simple plain object with only 2 mandatory properties: `req`, `res`, which are the `IncomingMessage` and the `ServerResponse` HTTP native objects.

The error handlers receive the same object, but with an additonal `error` property.

```ts
declare type Literal = { [x: string]: any; };

declare interface Context extends Literal {
  req: IncomingMessage;
  res: ServerResponse;
  error?: any;
}
```

### `.set(key, value)`
To extend the request context, and add shared properties, like a DB connection, or a global logger, you may use `.set()`

```js
const mongoose = require('mongoose')

await mongoose.connect('mongodb://localhost/test')

app.set('db', mongoose)
```

### `.bind(key, fn)`
To set a per request private properties, you may use `.bind()`. This method takes a field name, and a function to be used as a `lazy` getter of the field value.

```js
app.bind('session', () => new Session(options))
```

This method is very useful, since it allows you to lazily (only when needed) attach a per request property into the context without adding a dedicated handler.

### `.has(key)`
You may use it to check the existence of a certain field

### `.get(key)`
You may use it to get a previously defined field value.

## Contributing
You have a lot of ways to help the project grow.

- Report an [issue](https://github.com/aldojs/aldo/issues)
- Propose a [feature](https://github.com/aldojs/aldo/issues)
- Send a [pull request](https://github.com/aldojs/aldo/pulls)
- Star the project on [GitHub](https://github.com/aldojs/aldo)
- Tell about project around your community

All contributions are appreciated, even the smallest. Thank you!

## License
[MIT License](https://opensource.org/licenses/MIT)
