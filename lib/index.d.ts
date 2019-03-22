
import { Middleware, Handler, Dispatcher } from './middleware'

export declare type Container = Map<string | symbol, any>;

export declare interface Router {
  dispatch(context: object): any;
}

export declare class Application extends Dispatcher {
  /**
   * 
   * @param fns 
   * @param map 
   */
  constructor(fns: Middleware[], map: Container);

  /**
   * Use a middleware.
   *
   * @param fn The middleware function.
   * @throws if the middleware is not a function.
   * @public
   */
  use(fn: Middleware): this;

  /**
   * Register a raw binding
   *
   * @param name The binding name
   * @param value The binding value
   * @public
   */
  set(name: string, value: any): this;

  /**
   * Return the raw binding value
   *
   * @param name The binding name
   * @public
   */
  get(name: string): any;

  /**
   * Check if the binding name is already registered
   *
   * @param name The binding name
   * @public
   */
  has(name: string): boolean;
}

/**
 * Initialize a new application
 * 
 * @param fns  
 * @param map 
 */
export declare function createApplication (fns: Function[], map?: Container): Application;
