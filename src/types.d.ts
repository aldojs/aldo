
/// <reference types="node" />

import { ListenOptions } from 'net'
import { Request, Response, Server, CreateServerOptions } from 'aldo-http'

declare type Literal = { [x: string]: any; };

declare type FinalHandler = (ctx: Context) => any;

declare type ErrorMiddleware = (ctx: Context, next: () => any) => any;

declare type RouteStoreEntry = { handler: FinalHandler; params: Literal; };

declare type Middleware = (ctx: Context, next: (error?: any) => any) => void;

declare interface Dispatcher {
  use(...router: Router[]): any;
  pre(...fn: Middleware[]): any;
  post(...fn: Middleware[]): any;
  catch(...fn: Middleware[]): any;
  finally(fn: FinalHandler): any;
  dispatch(req: Request, res: Response): any;
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
  start(port: number, options?: CreateServerOptions): Promise<Server>;
  start(listenOptions: ListenOptions, options?: CreateServerOptions): Promise<Server>;
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

  as(name: string): any;
  prefix(value: string): any;
  all(...fns: Middleware[]): any;
  get(...fns: Middleware[]): any;
  put(...fns: Middleware[]): any;
  head(...fns: Middleware[]): any;
  post(...fns: Middleware[]): any;
  patch(...fns: Middleware[]): any;
  delete(...fns: Middleware[]): any;
  options(...fns: Middleware[]): any;
  any(methods: string[], ...fns: Middleware[]): any;
  handlers(): IterableIterator<[string, Middleware[]]>;
}

declare interface Router {
  routes(): Route[];
  use(fn: Middleware): any;
  prefix(value: string): any;
  route(path: string): Route;
  all(path: string, ...fns: Middleware[]): any;
  get(path: string, ...fns: Middleware[]): any;
  put(path: string, ...fns: Middleware[]): any;
  head(path: string, ...fns: Middleware[]): any;
  post(path: string, ...fns: Middleware[]): any;
  patch(path: string, ...fns: Middleware[]): any;
  delete(path: string, ...fns: Middleware[]): any;
  options(path: string, ...fns: Middleware[]): any;
  any(method: string[], path: string, ...fns: Middleware[]): any;
}
