
> This project is under heavy development, and the API may change frequently.

`Aldo` is yet another framework to build Node.js web applications.
It uses the best parts of `Koa` and `Express` to provide a fast engine for your web projects.

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
app.start(3000)
```

## Request Flow
The request handling logic is similar to the `try..catch..finally` JavaScript block.
In other words, the application will try to call the route handlers one by one to the final handler.
If an error occurs, it will be handled by the error handlers before reaching the final handler which will terminate and send the response to the client.

You can use `.pre`, `.post`, `.use`, `.catch` and `.finally` application's methods to control the flow of request handling.

```js
const app = new Application()

// 1. The `try` block

// attach one or more global handlers before the route
// useful to configure global services like session, cache ...etc
app.pre(...handlers)

// use one or many routers with `.use`
app.use(...routers)
// ... etc

// attach global handlers to be executed after the route handlers
// like saving a cached version, persisting session data, setting more headers ...etc
app.post(...handlers)


// 2. The `catch` block

// attaching error handlers is done as below
app.catch(...handlers)


// 3. The `finally` block

// at last, only one final handler is used
// the default one is simply sending the response
app.finally(finalHandler)
```

> Since each method controls a processing step, the order doesn't matter any more.
> We can define routes before or after the final handler, it won't create any issue, since the routes are only compiled during the application launch.

Unlike the other web frameworks, each `handler` takes only **one** argument: the **`context`**. This object holds everything you need to handle the incoming HTTP request.
Handlers may return *void* or a promise for asynchronous functions.

So, when the current handler finished its job, the *context* object is passed automatically to the next handler, and so on, till the final handler which terminates and ends the response.

```ts
// Handler function signature
declare type Handler = (ctx: Context) => any
```

## Context
The context object is not a proxy to the request and response properties, it's a simple plain object with only 4 mandatory properties `app`, `request`, `response` and route `params`.
Even the error handlers have the same signature, but with an additonal `error` property.

```ts
declare type Literal = { [x: string]: any }

declare interface Context extends Literal {
  response: Response; // Response object provided by the package `aldo-http`
  request: Request;   // Request object provided by the package `aldo-http`
  app: Application;   // Application instance
  params: Literal;    // Route parameters
  error?: any;        // The error
}
```
To extend the request context, and add more properties, you can use `app.set(key, value)` or `app.bind(key, factory)`
```js
// set a global value to be available for all requests
app.set('mongo', dbConnection)

// set a per request property using a function to lazily get the value
// This time, each context instance has a distinct `session` property
app.bind('session', () => new Session(options))
```

`app.has(key)` and `app.get(key)` are also available to check the existence of a certain field, or to get a previously defined property.

## Router
Each `router` instance control an erea in the application, it acts like a route namespace.
You can use as many routers as you need. For example, a router to manage authentication, another for the API, a private router for admin routing, and so on.

> The order of defining routes is not important any more. Thanks to [find-my-way](https://npmjs.com/find-my-way) witch is a [radix tree](https://en.wikipedia.org/wiki/Radix_tree).

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
