
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
  end(body?: any): void;
}
