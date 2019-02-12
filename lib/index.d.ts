
import { Container, Factory } from '@aldojs/container'
import { Dispatcher, Middleware } from '@aldojs/middleware'

/**
 * Initialize a new application
 * 
 * @param dispatcher 
 * @param container 
 */
export declare function createApplication (
  dispatcher?: Dispatcher, container?: Container
): Application;

/**
 * 
 */
export declare class Application {
  /**
   * 
   * @param dispatcher 
   * @param container 
   */
  constructor(dispatcher: Dispatcher, container: Container);

  /**
   * Use a middleware.
   *
   * @param fn The middleware function.
   * @throws if the middleware is not a function.
   * @public
   */
  use(fn: Middleware): this;

  /**
   * Handle the context and return the result
   *
   * @param context
   * @public
   */
  handle(context: object): any;

  /**
   * Register a binding in the container
   *
   * @param name The binding name.
   * @param fn The factory function.
   * @throws if the factory is not a function.
   * @public
   */
  bind(name: string, fn: Factory): this;

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
