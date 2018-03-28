
/// <reference types="node" />

import { Server } from 'http'

declare type Literal = { [x: string]: any; };

declare type Handler = (ctx: Context) => any;

declare interface Dispatcher {
  onError(fn: Handler): any;
  dispatch(ctx: Context): void;
  onFinished(fn: Handler): void;
  register(method: string, path: string, fns: Handler[]): any;
}

declare interface Application {
  listen(): Server;
  get(prop: string): any;
  finally(fn: Handler): any;
  has(prop: string): boolean;
  pre(...fn: Handler[]): any;
  post(...fn: Handler[]): any;
  catch(...fn: Handler[]): any;
  use(...router: Router[]): any;
  set(prop: string, value: any): this;
  callback(): (req: Request, res: Response) => void;
  bind(prop: string, fn: (ctx: Context) => any): this;
  on(method: string | string[], path: string | string[], ...fns: Handler[]): this;
}

declare interface Context extends Literal {
  error?: any;
  req: Request;
  res: Response;
  params: Literal;
}

declare interface Request extends Literal {
  url: string;
  method: string;
}

declare interface Response extends Literal {
  end(content?: any): void;
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
