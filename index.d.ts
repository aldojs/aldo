
/// <reference types="node" />

import * as http from 'http';

export type Literal = { [x: string]: any; };

export type Handler = (ctx: Context) => any;

export interface Context extends Literal {
  req: http.IncomingMessage;
  res: http.ServerResponse;
  error?: any;
}

/**
 * 
 */
export class Application {
    private _handlers;
    private _errorHandlers;
    private _context;

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
     * Use request handlers
     *
     * @param fns
     */
    use(...fns: Handler[]): this;

    /**
     * Use error handlers
     *
     * @param fns
     */
    catch(...fns: Handler[]): this;

    /**
     * Shorthand for:
     *
     *     http.createServer(app.callback()).listen(...args)
     */
    listen(): http.Server;

    /**
     * Return a request callback
     */
    callback(): (req: http.IncomingMessage, res: http.ServerResponse) => void;
}
