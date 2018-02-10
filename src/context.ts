
import { Container, Context } from './types'
import { Request, Response } from 'aldo-http'

const handler = {
  get (ctx: Context, prop: string) {
    if (!(prop in ctx) && ctx.app.has(prop)) {
      ctx[prop] = ctx.app.get(prop, ctx)
    }

    return ctx[prop]
  }
}

/**
 * Request context factory
 * 
 * @param {Container} app
 * @param {Request} request
 * @param {Response} response
 * @returns {Proxy<Context>}
 */
export function create (app: Container, request: Request, response: Response): Context {
  return new Proxy({ app, request, response }, handler)
}
