
## Introduction
`Aldo` is another library to build web applications for Node.js.

It uses the best parts of `Koa`, `Express` and `Fastify` to make building restful applications fun and easy.

`Aldo`'s goal is to provide a secure and solid foundation for your projects, a fast execution and a fluent API.

## Installation
```bash
npm add aldo
```

## Testing
```bash
npm test
```
> More tests are comming in the future

## Usage
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
