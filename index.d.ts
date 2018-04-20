
/// <reference types="node" />

import * as http from 'http';

export interface Context {
  req: http.IncomingMessage;
  res: http.ServerResponse;
  [field: string]: any;
}

export class Application {
  /**
   * Extend the app context by adding per instance property
   *
   * @param prop
   * @param fn
   */
  bind(prop: string, fn: (ctx: Context) => any): this;

  /**
   * Extend the app context by adding shared properties
   *
   * @param prop
   * @param value
   */
  set(prop: string, value: any): this;

  /**
   * Get a value from the app context
   *
   * @param prop
   */
  get(prop: string): any;

  /**
   * Check if the prop is defined in the app context
   *
   * @param prop
   */
  has(prop: string): boolean;

  /**
   * Use request middleware
   *
   * @param fn
   */
  use(fn: (ctx: Context, next: () => Promise<void>) => any): this;

  /**
   * Shorthand for:
   *
   *     http.createServer(app.callback()).listen(...args)
   */
  listen(...args: any[]): http.Server;

  /**
   * Return a request listener
   */
  callback(): (req: http.IncomingMessage, res: http.ServerResponse) => void;
}
