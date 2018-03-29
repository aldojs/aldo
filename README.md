
> This project is under heavy development, and the API is unstable and may change frequently.

`Aldo` is yet another framework to build web applications for Node.js 8+.
It uses the best parts of other web frameworks to provide a fast engine for your projects.

## Installation
```bash
npm add aldo
```

## Testing
```bash
npm test
```

## Hello world!
```js
// dependencies
const { Application } = require('aldo')

const app = new Application()

// define a `hello world` route
app.on('GET', '/', ({ res }) => {
  res.setHeader('Content-Type', 'text/plain')
  res.end('Hello world!')
})

// create a HTTP server to serve the application
app.listen(3000)
```

## Request Flow
---
The request handling logic is similar to the `try..catch..finally` JavaScript block.
In other words, the application will try to call the handlers one by one till the final handler.
If an error occurs, it will be handled by the error handlers before reaching the final handler which will terminate and send the response to the client.

> TODO use a flow chart to demonstrate the process

### &#10145; The ***try*** block
The dispatcher will try to dispatch the [*context*](#context) object to the route handlers one by one till the last one in stack.

### &#10145; The ***catch*** block
If an error is thrown during the *try* block, the [*context*](#context) object will be augmented with the `error` object, and dispatched to the error handlers to process it.

### &#10145; The ***finally*** block
This block contain only a single handler, and will be invoked, as a last processing step, to terminate the request and send the response to the client.

## Handlers
---
Unlike the other web frameworks, each `handler` takes only **one** argument: the [*context*](#context), which is a literal object that holds everything you need to handle the incoming HTTP request.

When the current handler finished its job, the context object is passed automatically to the next handler, and so on, until the final handler which terminates and ends the response.
To break the chain, just return `false` or `Promise<false>`, to get the final handler called instead of the next middleware.

```ts
// Handler function signature
declare type Handler = (ctx: Context) => any;
```

### Route handlers
To define route handlers, you may use `.on(method, path, ...fns)` or `.use(...routers)`
```js
const app = new Application()

// define handlers for a specific "METHOD URL"
app.on(method, path, ...handlers)

// use routes defined within a router
app.use(...routers)
```

> The order of defining routes is not important any more. Thanks to [find-my-way](https://npmjs.com/find-my-way) witch is a [radix tree](https://en.wikipedia.org/wiki/Radix_tree).

It's possible to add `before route` or `after route` handlers with `.pre(...fns)` and `.post(...fns)`

```js
// attach one or more global handlers before the route
// useful to configure global services like session, cache ...etc
app.pre(...handlers)

// attach global handlers to be executed after the route handlers
// like saving a cached version, persisting session data, setting more headers ...etc
app.post(...handlers)
```

> It's important to note, that the route handlers are directly compiled at the moment of the registeration with `.on` or `.use`. So, any post handler added after the route will not be invoked.

> Note also, that the `post` handlers are exceptionally invoked in **reverse order** (<abbr title="Last In First Out">LIFO</abbr>) unlike the others.

### Error handlers
You may attach error handlers as many as needed with `.catch(...fns)`.
Each error thrown is attached to the context object and passed to each handler one by one, unless you return a `false` which forces the dispatcher to omit the following and invoke only the final handler.

```js
app.catch(...handlers)
```

### Final handler
The default final handler ends the response stream.
If you want to change that behavior, simply set a custom handler with `.finally(fn)`.

```js
app.finally(customHandler)
```

## Context
---
The context object is not a proxy to the request and response properties, it's a simple plain object with only 3 mandatory properties: `req`, `res` and the route `params`.
Even the error handlers have the same signature, but with an additonal `error` property.

```ts
declare type Literal = { [x: string]: any; };

declare interface Context extends Literal {
  error?: any;      // The error
  req: Request;     // IncomingMessage object
  res: Response;    // ServerResponse object
  params: Literal;  // Route parameters
}

declare interface Request extends Literal {
  url: string;
  method: string;
}

declare interface Response extends Literal {
  end(): void;
}
```

### `.set(key, value)`
To extend the request context, and add shared properties, like a DB connection, a global logger, you may use `.set()`
```js
const mongoose = require('mongoose')

await mongoose.connect('mongodb://localhost/test')

app.set('mongoose', mongoose)
```

### `.bind(key, fn)`
To set a per request private properties, you may use `.bind()`. This method takes a field name, and a function to be used as a `lazy` getter of the field value.

```js
app.bind('session', () => new Session(options))
```

This method is very useful, since it allows you to lazily (only when needed) attach a per request property into the context without adding a pre handler.

### `.has(key)`
You may use it to check the existence of a certain field

### `.get(key)`
You may use it to get a previously defined field value.

## Router
---
Each `router` instance control an erea in the application, it acts like a namespace more than a router.
You can use as many routers as you need. For example, a router to manage authentication, another for the API, a private router for admin routing, and so on.

```js
const { Router } = require('aldo')
const { Users } = require('./controllers')

// Let's create an admin area router
// `/admin` is a URL prefix for all routes
const router = new Router('/admin')

// define a single handler for admin home page for the GET method
router.get('/', Users.home)

// we can define multiple handlers per HTTP method for the same route
router
  .route('/Users')
  .get(Users.show)
  .delete(Users.delete)
  .post(Users.validate, Users.add)
  .put(Users.validate, Users.modify)
```

## License
[MIT License](https://opensource.org/licenses/MIT)
