
/// <reference types="node" />

import { Server, IncomingMessage, ServerResponse } from 'http'

declare type Literal = { [x: string]: any; };

declare type Handler = (ctx: Context) => any;

declare interface Application {
  get(prop: string): any;
  has(prop: string): boolean;
  use(...fn: Handler[]): any;
  catch(...fn: Handler[]): any;
  listen(...args: any[]): Server;
  set(prop: string, value: any): this;
  bind(prop: string, fn: (ctx: Context) => any): this;
  callback(): (req: IncomingMessage, res: ServerResponse) => void;
}

declare interface Context extends Literal {
  req: IncomingMessage;
  res: ServerResponse;
  error?: any;
}
