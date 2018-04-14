
import * as http from 'http'

declare type Literal = { [x: string]: any; };

declare type Handler = (ctx: Context) => any;

declare type ErrorHandler = (err: any, ctx: Context) => any;

declare interface Context extends Literal {
  req: http.IncomingMessage;
  res: http.ServerResponse;
  error?: any;
}
