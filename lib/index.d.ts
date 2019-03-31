
import { Middleware, Dispatcher } from '@aldojs/middleware';

export declare type Container = Map<string | symbol, any>;

export declare class Application extends Dispatcher {
  /**
   * Initialize a new application
   * 
   * @param fns 
   * @param map 
   */
  constructor(fns: Middleware[], map: Container);

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
 * @throws if `fns` is not a valid array of middlewares.
 */
export declare function createApplication (fns: Middleware[], map?: Container): Application;
