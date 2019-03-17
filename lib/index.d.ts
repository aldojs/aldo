
export declare type Middleware = (fn: Handler) => (context: object) => any;

export declare type Container = Map<string | symbol, any>;

export declare type Handler = (context: object) => any;

export declare interface Dispatcher {
  dispatch(context: object): any;
}

export declare class Application {
  /**
   * 
   * @param dispatcher 
   * @param map 
   */
  constructor(dispatcher: Dispatcher, map: Container);

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
 * @param dispatcher 
 * @param map 
 */
export declare function createApplication (dispatcher: Dispatcher, map?: Container): Application;
