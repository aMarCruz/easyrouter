//#endregion
var router = (function easyRouter(window) {
    //#region Closure data -----------------------------------------------------
    var UNDEF = void 0;
    var NULL = null;
    /** Matches in $1 the hash without the first "#/" nor final slash */
    var R_HASH = /^#?\/*(.*?)\/*$/;
    var S_PARM_PREFIX = ':';
    var S_PARM_NAME = '~';
    var S_ROUTE_NODE = '@';
    var S_HASH_EVT = 'hashchange';
    // tslint:disable:no-var-keyword
    // Forward declaration of the router object
    var R;
    // The internal state
    var _active = false;
    var _hash = '';
    var _prevRoute = NULL;
    var _lastRoute = NULL;
    var _routes = {};
    // global callbacks
    var _rescue = UNDEF;
    var _onEnter = UNDEF;
    var _onExit = UNDEF;
    // tslint:enable:no-var-keyword
    //#endregion
    //#region Private functions ------------------------------------------------
    var _decode = decodeURIComponent;
    var _noop = function (s) { return s; };
    /**
     * Check if the paramater is a function.
     */
    // tslint:disable-next-line:ban-types
    var _fn = function (fn) { return (typeof fn === 'function' ? fn : UNDEF); };
    /**
     * Hash normalization, adds the first '#' and removes the last slash.
     */
    var _normalize = function (hash) {
        switch (hash) {
            case '':
            case '#':
                return '#';
            case '/':
            case '#/':
                return '#/';
            default:
                return hash.replace(R_HASH, '#/$1');
        }
    };
    /**
     * Remove the first '#/' and trailing slashes from the given hash
     * and return its parts.
     */
    var _split = function (hash) {
        var parts = hash.replace(R_HASH, '$1').split('/');
        var item;
        var i = parts.length;
        while (--i >= 0) {
            item = parts[i];
            if (!item || item === '#') {
                parts.splice(i, 1);
            }
            else if (item[0] !== S_PARM_PREFIX) {
                parts[i] = item.toLowerCase();
            }
        }
        return parts;
    };
    /**
     * Determinate if two route paths have the same params.
     */
    var _equ = function (a, b) {
        // First try to avoid slow cycle
        if (a.path.toLowerCase() !== b.path.toLowerCase()) {
            return false;
        }
        return _split(a.path).every(function (p) { return !(p[0] === S_PARM_PREFIX && (p = p.substr(1)) && a.params[p] !== b.params[p]); });
    };
    /**
     * Makes a shallow copy of route `src`.
     * Returns `null` if `src` is falsy.
     */
    var _make = function (src, hash, params) {
        if (!src) {
            return NULL;
        }
        var dest = {};
        var keys = Object.keys(src);
        for (var i = 0; i < keys.length; i++) {
            var prop = keys[i];
            dest[prop] = src[prop];
        }
        dest.hash = hash;
        dest.params = params;
        return dest;
    };
    /**
     * Find the route which the given hash belongs to.
     */
    var _seek = function (part, hash, unesc) {
        // can't use _split with a hash
        var parts = part.replace(R_HASH, '$1').split('/').filter(Boolean);
        var parms = {};
        var route = _routes;
        var name;
        for (var i = 0; i < parts.length; i++) {
            part = unesc(parts[i]);
            name = part.toLowerCase();
            name = name in route ? name : S_PARM_PREFIX in route ? S_PARM_PREFIX : '*';
            route = route[name];
            if (!route) {
                return NULL;
            }
            if (name === '*') {
                break;
            }
            if (route[S_PARM_NAME]) {
                parms[route[S_PARM_NAME]] = part;
            }
        }
        return _make(route[S_ROUTE_NODE], hash, parms);
    };
    /**
     * Parses the queryString part.
     */
    var _query = function (route, queryStr, unesc) {
        if (route) {
            var qs = queryStr.split('&');
            for (var i = 0; i < qs.length; i++) {
                var pair = qs[i].split('=');
                route.params[unesc(pair[0])] = unesc(pair[1]);
            }
        }
        return route;
    };
    /**
     * Main method to define a new route.
     *
     * The path is normalized and converted to lower case, except the
     * parameter names. Some examples:
     *
     * - '#/path/subpath'    => '#/path/subpath' (no changes)
     * - '/path/subpath'     => '#/path/subpath' (add the first '#')
     * - '#path/subpath'     => '#/path/subpath' (add the first '/')
     * - '#path/SubPath'     => '#/path/subpath' (to lower case)
     * - '#path/SubPath/:Id' => '#/path/subpath/:Id' (to lower case, except ':Id')
     *
     * @param {RouteContext} src
     * @param {Callback} [enter]
     * @returns {RouteContext} Route
     */
    var _add = function (src, enter) {
        var path = _normalize(src.path);
        var route = _routes;
        _split(path).forEach(function (part) {
            var parm = part[0] === S_PARM_PREFIX;
            var name = parm ? S_PARM_PREFIX : part;
            route = route[name] || (route[name] = {});
            if (parm) {
                route[S_PARM_NAME] = part.slice(1);
            }
        });
        route = route[S_ROUTE_NODE] = { path: path, enter: enter };
        Object.keys(src).forEach(function (p) {
            if (p !== 'path') {
                route[p] = src[p];
            }
        });
        return R;
    };
    /**
     * Run the query callback if we have the same params of the previous
     * route for the non-queryStr parts (i.e. route is already loaded).
     */
    var _queryAbort = function (prev, next) {
        if (prev && prev.query &&
            _equ(prev, next) && prev.query(next.params) === false) {
            R.navigate(prev.hash);
            return true;
        }
        return false;
    };
    /**
     * Trigged on hash changes.
     */
    var _run = function (hash) {
        hash = _normalize(hash);
        // Must preserve the case of the hash
        if (_hash.toLowerCase() !== hash.toLowerCase()) {
            var prev = _lastRoute;
            var next = R.match(hash);
            // Hook for query-string changes through the `query` method of the route.
            // It runs only if we have the same params for the non-queryString parts
            // (i.e. hash is already current).
            if (next && _queryAbort(prev, next)) {
                return false;
            }
            // if we have a previous route, call its `exit`
            // method and abort if `exit` returns `false`
            if (prev && prev.exit && prev.exit(prev.params) === false) {
                return false;
            }
            // continue with the global `exit` routine.
            if (_onExit) {
                _onExit.call(R, prev, next);
            }
            // swap the current route info
            _hash = hash;
            _prevRoute = prev;
            _lastRoute = next;
            // call the global enter routine
            if (_onEnter) {
                _onEnter.call(R, next, prev);
            }
            // if we have a new route with a `next` method, call it and return
            if (next && next.enter) {
                next.enter(next.params);
                return true;
            }
            // next not found or has no `enter` method, fallback to rescue
            if (_rescue && hash) {
                _rescue.call(R, hash);
            }
        }
        // no route or the current route has no changes
        return false;
    };
    /**
     * Default handler for hash changes
     */
    var _handler = function () {
        return _run(location.hash);
    };
    //#endregion
    //#region Public API -------------------------------------------------------
    R = {
        /*#if process.env.BUILD === 'test'
        _split: _split,
        _normalize: _normalize,
        _run: _run,
        //#endif */
        /**
         * Register one or more routes (rules and methods).
         *
         * @param   {RouteContext|RouteContext[]} data Array of templates for the routes
         * @param   {Function} [cb] Optional 'on' function
         * @returns {this} This chainable object.
         * @deprecated
         */
        add: function (data, cb) {
            cb = _fn(cb);
            if (Array.isArray(data)) {
                data.forEach(function (src) { _add(src, cb); });
            }
            else {
                _add(data, cb);
            }
            return R;
        },
        /**
         * Empties the routes.
         *
         * The global callbacks (onEnter, onExit, rescue) are preserved.
         */
        clear: function () {
            _routes = {};
            return R;
        },
        /**
         * Returns the context of the router. It includes the current route or
         * `null` if there's no saved route (like after a `reset`).
         *
         * @returns {Router.Context}
         */
        getContext: function () {
            var last = _lastRoute;
            var prev = _prevRoute;
            return {
                isActive: _active,
                lastHash: _hash,
                lastRoute: last ? _make(last, last.hash, last.params) : null,
                prevRoute: prev ? _make(prev, prev.hash, prev.params) : null,
                onEnter: _onEnter,
                onExit: _onExit,
                rescue: _rescue,
            };
        },
        /**
         * Start handling hash changes.
         *
         * `root` is the hash for URLs without a defined path to which a user
         * will be redirected.
         *
         * This route will be automatically selected in the page load, unless
         * the page already has a hash.
         *
         * @param   {string} [root] The "root" hash (default is "#").
         * @returns {this} This chainable object.
         */
        listen: function (root) {
            // check browser haschange support
            // istanbul ignore else
            if ('onhashchange' in window) {
                R.stop();
                window.addEventListener(S_HASH_EVT, _handler, true);
            }
            else {
                throw new Error("easyRouter: Your browser has no 'hashchange' support");
            }
            // normalize root
            root = root && _normalize(root) || '#';
            // set a default rescue funtion if there's no one
            if (!_rescue) {
                _rescue = function () { R.navigate(root); };
            }
            // if we have a hash, run it
            if (location.hash) {
                _run(location.hash);
                // else if we have a root, set it (it will run automatically)
            }
            else {
                R.navigate(root);
            }
            // mark the router as active
            _active = true;
            return R;
        },
        /**
         * Returns an object with the route for a matching hash.
         *
         * The route includes the parameters given in the hash.
         *
         * @param   {string} hash hash to match
         * @returns {RouteContext|null} `null` if href has not matching route.
         */
        match: function (hash) {
            var unesc = hash.indexOf('%') < 0 ? _noop : _decode;
            var start = hash.indexOf('?');
            var query = start < 0 ? '' : hash.substr(start + 1);
            var path = start < 0 ? hash : hash.substr(0, start);
            return query
                ? _query(_seek(path, hash, unesc), query, unesc)
                : _seek(path, hash, unesc);
        },
        /**
         * Goes to the given hash.
         *
         * If `force` is `true`, the callback runs even if the hash is current.
         *
         * @param   {string}  hash The target hash
         * @param   {Boolean} [force] `true` to always run the callback
         * @returns {this} This chainable object.
         */
        navigate: function (hash, force) {
            if (force) {
                _hash = '@';
            }
            if (force && _normalize(location.hash) === _normalize(hash)) {
                _run(hash);
            }
            else {
                location.hash = hash;
            }
            return R;
        },
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
         * @param {Function} cb Enter callback.
         * @returns {this} This chainable object.
         */
        onEnter: function (cb) {
            _onEnter = _fn(cb);
            return R;
        },
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
         * @param {Function} cb Callback
         * @returns {this} This chainable object.
         */
        onExit: function (cb) {
            _onExit = _fn(cb);
            return R;
        },
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
         * @param {Function} cb Callback to execute.
         * @returns {this} This chainable object.
         */
        rescue: function (cb) {
            _rescue = _fn(cb);
            return R;
        },
        /**
         * Clears the routes and global callbacks, without stopping the router.
         *
         * Generally, this method will be followed by `stop` or by a re-initialization.
         *
         * @returns {this} This chainable object.
         */
        reset: function () {
            _hash = '';
            _prevRoute = _lastRoute = NULL;
            _rescue = _onEnter = _onExit = UNDEF;
            return R.clear();
        },
        /**
         * Returns the route object assigned to a given rule.
         *
         * The parameter is the rule used to register a route, it is not the hash
         * of the current location.
         *
         * The returned object does not includes the hash nor parameters values.
         *
         * @param {string} path Rule to match in route `path` property.
         * @returns {Route|null}
         */
        route: function (path) {
            var parts = _split(_normalize(path));
            var route = _routes;
            for (var part = void 0, i = 0; i < parts.length && route; i++) {
                part = parts[i];
                route = route[part[0] === S_PARM_PREFIX ? S_PARM_PREFIX : part];
            }
            return route && route[S_ROUTE_NODE] || NULL;
        },
        /**
         * Stops the router.
         *
         * Registered routes or global callbacks are preserved.
         *
         * You will need to call `listen` to re-enable the router.
         */
        stop: function () {
            _active = false;
            window.removeEventListener(S_HASH_EVT, _handler, true);
            return R;
        },
    };
    //#endregion
    return R;
})(window);
export default router;
