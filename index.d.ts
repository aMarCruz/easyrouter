
export = Router

declare const Router: Router

declare interface Router {
  /**
   * Register one or more routes.
   *
   * The received objects are used as a template to generate the routes.
   * The rule is extracted from its 'path' property.
   *
   * @param routes Object or array of objects with the data of the routes.
   * @param cb Default "enter" method for each routes (particular `enter` will ovewrite it).
   */
  add(data: Router.Route | Router.Route[], cb?: Router.EnterFn): this

  /**
   * Empties the routes.
   *
   * The global callbacks (onEnter, onExit, rescue) are preserved.
   */
  clear(): this

  /**
   * Start handling hash changes.
   *
   * `root` is the hash for URLs without a defined path to which a user
   * will be redirected.
   *
   * This route will be automatically selected in the page load, unless
   * the page already has a hash.
   *
   * @param root The "root" hash (default is "#").
   */
  listen(root?: string): this

  /**
   * Set the global callback called when no rule matches the hash.
   *
   * If you do not provide a `rescue` method, the router will set one to
   * redirect your users to the "root" defined by the `listen` method.
   *
   * This lets you provide instant user feedback if they click an
   * undefined route.
   *
   * @param cb Callback to execute.
   */
  rescue(cb: Router.RescueFn): this

  /**
   * Clears the routes and global callbacks, without stopping the router.
   *
   * Generally, this method will be followed by `stop` or by a re-initialization.
   */
  reset(): this

  /**
   * Returns the route object assigned to a given rule.
   *
   * The parameter is the rule used to register a route, it is not the hash
   * of the current location.
   *
   * The returned object does not includes the hash nor parameters values.
   *
   * @param rule Rule to match in route `path` property.
   */
  route(rule: string): Router.RouteContext | null

  /**
   * Returns an object with the route for a matching hash.
   *
   * @param hash
   */
  match(hash: string): Router.RouteContext | null

  /**
   * Go to the given hash.
   *
   * If force is true, the callback runs even if the hash is current.
   *
   * @param hash Hash to set
   * @param force Execute the callback unconditionally?
   */
  navigate(hash: string, force?: boolean): this

  onEnter(cb: Router.OnEnterFn): this

  onExit(cb: Router.OnExitFn): this

  /**
   * Stops the router.
   *
   * Any routes or global callbacks are preserved.
   *
   * You will need to call `listen` to re-enable the router.
   */
  stop(): this
}

// tslint:disable-next-line:no-namespace
declare namespace Router {

  interface Dict<T = any> { [k: string]: T }

  type Params = Dict<string>

  type ExitFn     = (this: RouteContext, prevParams: Params) => boolean | void
  type EnterFn    = (this: RouteContext, currentParams: Params) => void
  type QueryFn    = (this: RouteContext, currentParams: Params) => boolean | void
  type OnExitFn   = (this: Router, prevRoute: RouteContext | null) => void
  type OnEnterFn  = (this: Router, currentRoute: RouteContext | null) => void
  type RescueFn   = (this: Router, currentHash: string) => void

  interface Route {
    /** String with the rule */
    path: string
    /** Called when the hash changes */
    enter?: EnterFn
    /** Called when the query-string changes for a same hash */
    query?: QueryFn
    /** Called when leaving a route */
    exit?: ExitFn
    /** User-defined values */
    [k: string]: any
  }

  interface RouteContext {
    /** String with the rule (normalized) */
    path: string
    /** Called when entering in a new hash */
    enter?: EnterFn
    /** Called when the query-string changes for a same hash */
    query?: QueryFn
    /** Called when leaving a route */
    exit?: ExitFn
    /** Matched hash (normalized) */
    hash: string
    /** parameters in the hash and query-string */
    params: Params
    /** User-defined values */
    [k: string]: any
  }

  interface Context {
    isActive: boolean,
    lastHash: string,
    lastRoute: RouteContext | null,
    onEnter?: OnEnterFn,
    onExit?: OnExitFn,
    rescue?: RescueFn,
  }

  interface Router {
    /**
     * Registers one or more routes.
     *
     * The received objects are used as a template to generate the routes.
     * The rule is extracted from its 'path' property.
     *
     * @param routes Object or array of objects with the data of the routes.
     * @param cb Default "enter" method for each routes (particular `enter` will ovewrite it).
     */
    add(data: Route | Route[], cb?: EnterFn): this

    /**
     * Empties the routes.
     *
     * The global callbacks (onEnter, onExit, rescue) are preserved.
     */
    clear(): this

    /**
     * Returns the context of the router. It includes the current route or
     * `null` if there's no saved route (like after a `reset`).
     */
    getContext(): Context,

    /**
     * Start handling hash changes.
     *
     * `root` is the hash for URLs without a defined path to which a user
     * will be redirected.
     *
     * This route will be automatically selected in the page load, unless
     * the page already has a hash.
     *
     * @param root The "root" hash (default is "#").
     */
    listen(root?: string): this

    /**
     * Returns an object with the route for a matching hash.
     *
     * The route includes the parameters given in the hash.
     *
     * @param hash
     */
    match(hash: string): RouteContext | null

    /**
     * Goes to the given hash.
     *
     * If `force` is `true`, the callback runs even if the hash is current.
     *
     * @param hash Hash to set
     * @param force Execute the callback unconditionally?
     */
    navigate(hash: string, force?: boolean): this

    /**
     * Set the global callback called with the current hash when no rule
     * matches the hash or the route has no an `enter` method.
     *
     * If you do not provide a `rescue` method, the router will set one to
     * redirect your users to the "root" defined by the `listen` method.
     *
     * This lets you provide instant user feedback if they click an
     * undefined route.
     *
     * @param cb Callback to execute.
     */
    rescue(cb: RescueFn): this

    /**
     * Clears the routes and global callbacks, without stopping the router.
     *
     * Generally, this method will be followed by `stop` or by a re-initialization.
     */
    reset(): this

    /**
     * Returns the route object assigned to a given rule.
     *
     * The parameter is the rule used to register a route, it is not the hash
     * of the current location.
     *
     * The returned object does not includes the hash nor parameters values.
     *
     * @param rule Rule to match in route `path` property.
     */
    route(rule: string): Route | null

    /**
     * Set the global callback called _always_ that the hash changes, after
     * the `route.query`, `route.exit` and `router.onExit` methods.
     *
     * The parameter received by the callback is an object with the next route
     * data, and the default context (`this`) is the router itself.
     *
     * _NOTE:_
     *
     * This callback will be called even if there's no match for the next hash
     * or the new location has no hash. In this cases the parameter passed to
     * the callback will be `null`.
     *
     * In the last case it will be called once, when the hash is removed.
     *
     * @param cb Enter callback.
     */
    onEnter(cb: OnEnterFn): this

    /**
     * Set the global callback called when the hash changes, before the
     * `route.enter`, `router.onEnter` and `router.rescue` methods.
     *
     * The parameter received by the callback is an object with the previous
     * route data, and the default context (`this`) is the router itself.
     *
     * _NOTE:_
     *
     * This callback will be called even if there's no match for the previous
     * hash or the previous location has no hash. In this cases the
     * parameter passed to the callback will be `null`.
     *
     * @param cb Callback
     */
    onExit(cb: OnExitFn): this

    /**
     * Stops the router.
     *
     * Any routes or global callbacks are preserved.
     *
     * You will need to call `listen` to re-enable the router.
     */
    stop(): this
  }

}
