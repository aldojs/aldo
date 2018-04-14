
import * as http from 'http';

declare type Handler = (ctx: Context) => any;

declare type ErrorHandler = (err: any, ctx: Context) => any;

declare interface Context {
  req: http.IncomingMessage;
  res: http.ServerResponse;
  [key: string]: any;
}
