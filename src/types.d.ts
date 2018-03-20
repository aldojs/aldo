
/// <reference types="node" />

import { ListenOptions } from 'net'
import { Request, Response, Server, CreateServerOptions } from 'aldo-http'

declare type Literal = { [x: string]: any; };

declare type Handler = (ctx: Context) => any;

declare interface Dispatcher {
  use(...router: Router[]): any;
  pre(...fn: Handler[]): any;
  post(...fn: Handler[]): any;
  catch(...fn: Handler[]): any;
  finally(fn: Handler): any;
  dispatch(ctx: Context): any;
}

declare interface Container {
  get(prop: string): any;
  has(prop: string): boolean;
  set(prop: string, value: any): this;
  bind(prop: string, fn: (ctx: Context) => any): this;
  makeContext(request: Request, response: Response): Context;
}

declare interface Application extends Dispatcher, Container {
  stop(): Promise<Server>;
  callback(): (request: Request, response: Response) => void;
  start(port: number, ServerOptions?: CreateServerOptions): Promise<Server>;
  start(listenOptions: ListenOptions, ServerOptions?: CreateServerOptions): Promise<Server>;
}

declare interface Context extends Literal {
  error?: any;
  params: Literal;
  app: Application;
  request: Request;
  response: Response;
}

declare interface Route {
  readonly path: string;
  readonly name: string;

  as(name: string): Route;
  prefix(value: string): Route;
  all(...fns: Handler[]): Route;
  get(...fns: Handler[]): Route;
  put(...fns: Handler[]): Route;
  head(...fns: Handler[]): Route;
  post(...fns: Handler[]): Route;
  patch(...fns: Handler[]): Route;
  delete(...fns: Handler[]): Route;
  options(...fns: Handler[]): Route;
  handlers(): [string, Handler[]][];
  any(methods: string[], ...fns: Handler[]): Route;
}

declare interface Router {
  routes(): Route[];
  prefix(value: string): Router;
  route(path: string): Route;
  use(...fns: Handler[]): Router;
  all(path: string, ...fns: Handler[]): Route;
  get(path: string, ...fns: Handler[]): Route;
  put(path: string, ...fns: Handler[]): Route;
  head(path: string, ...fns: Handler[]): Route;
  post(path: string, ...fns: Handler[]): Route;
  patch(path: string, ...fns: Handler[]): Route;
  delete(path: string, ...fns: Handler[]): Route;
  options(path: string, ...fns: Handler[]): Route;
  any(method: string[], path: string, ...fns: Handler[]): Route;
}
