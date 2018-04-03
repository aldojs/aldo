
/// <reference types="node" />

import { Server, IncomingMessage, ServerResponse } from 'http'

declare type Literal = { [x: string]: any; };

declare type Handler = (ctx: Context) => any;

declare interface Dispatcher {
  onError(fn: Handler): any;
  dispatch(ctx: Context): void;
  onFinished(fn: Handler): void;
  register(method: string, path: string, fns: Handler[]): any;
}

declare interface Application {
  get(prop: string): any;
  finally(fn: Handler): any;
  has(prop: string): boolean;
  pre(...fn: Handler[]): any;
  post(...fn: Handler[]): any;
  catch(...fn: Handler[]): any;
  listen(...args: any[]): Server;
  set(prop: string, value: any): this;
  bind(prop: string, fn: (ctx: Context) => any): this;
  on(method: string | string[], path: string | string[], ...fns: Handler[]): this;
  callback(): (req: { url: string; method: string; }, res: { end(): void; }) => void;
}

declare interface Context extends Literal {
  error?: any;
  res: ServerResponse;
  req: IncomingMessage;
  params: { [x: string]: string; };
}
