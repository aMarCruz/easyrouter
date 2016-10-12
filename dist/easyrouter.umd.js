(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.router = factory());
}(this, (function () { 'use strict';

/**
 * Hash normalization, adds the first '#' and removes the last slash.
 *
 * @param   {String} hash - The hash to normalize
 * @returns {String} Normalized hash.
 */
function normalize (hash) {

  // if the hash is empty, this will output the '#' alone
  if (hash[0] !== '#') {
    hash = "#" + hash;
  }

  // only removing if length > 2 allows '#/'
  if (hash.length > 2 && hash.slice(-1) === '/') {
    hash = hash.slice(0, -1);
  }

  return hash
}

/*
 * PathJS wrapped module.
 *
 * PathJS is a lightweight, client-side routing library that allows you to create
 * "single page" applications using Hashbangs and/or HTML5 pushState.
 *
 * https://github.com/mtrpcic/pathjs
 *
 * Issues:
 * https://github.com/mtrpcic/pathjs/issues/80
 */
var easyRouter = (function _easyRouter (window, UNDEF) {
  'use strict';

  var location = window.location;
  var _decode = decodeURIComponent;
  var _noop = function (s) { return s; };

  var _routes = {};
  var _active = {};
  var _rescue;
  var _enter;
  var _exit;

  function _fn (fn) {
    return typeof fn == 'function' ? fn : UNDEF
  }

  function _split (hash) {
    return hash
          .replace(/^#?\/*(.*)\/*$/, '$1')
          .toLowerCase()
          .split('/')
  }

  function _seek (hash, esc) {
    var parts  = _split(hash);
    var params = {};
    var route = _routes;

    for (var i = 0; i < parts.length; i++) {
      var part = esc(parts[i]);
      var name = part in route ? part : ':' in route ? ':' : '*';

      route = route[name];
      if (!route) {
        return UNDEF
      }
      if (name === '*') {
        break
      }
      if (route['~']) {
        params[route['~']] = part;
      }
    }

    (route = route['@']).params = params;
    return route
  }

  function _query (ctx, url, esc) {
    if (url && ctx) {
      var qs = url.split('&');

      for (var i = 0; i < qs.length; i++) {
        var pair = qs[i].split('=');

        ctx.params[pair[0]] = esc(pair[1]);
      }
    }
    return ctx
  }


  var _R = {

    /**
     * Reset the router to their predefined values
     *
     * @returns {object} This chainable object
     */
    reset: function reset () {
      this.clear();
      _active.hash  = '';
      _active.route = _rescue = _enter = _exit = UNDEF;
      return this
    },

    clear: function clear () {
      Object.keys(_routes).forEach(function (p) { delete _routes[p]; });
      return this
    },

    /**
     * Main method to define a new route.
     *
     * @param   {String}   path  - The path that defines the route
     * @param   {Function} [cb]  - Callback function
     * @param   {Object}   [cfg] - Additional configuration
     * @returns {Object}   The new route
     */
    add: function add (path, cb, cfg) {
      var parts = _split(path);
      var route = _routes;

      if (cb && typeof cb == 'object' && !cfg) {
        cfg = cb;
        cb = UNDEF;
      }

      parts.forEach(function (part) {
        var name = part[0] === ':' ? ':' : part;

        route = route[name] || (route[name] = {});
        if (name === ':') { route['~'] = part.slice(1); }
      });

      route = route['@'] = { enter: cb };

      if (cfg) {
        Object.keys(cfg).forEach(function (p) {
          route[p] = cfg[p];
        });
      }
      route.path = path;
      return route
    },

    /**
     * Allows to define one or more routes.
     *
     * @param   {Array}    arr  - Array of templates for the routes
     * @param   {Function} [cb] - Optional 'on' function
     * @returns {Object}   This chainable object
     */
    concat: function concat (arr, cb) {
      var this$1 = this;

      cb = _fn(cb);

      arr.forEach(function (src) { this$1.add(src.path, cb, src); });
      return this
    },

    /**
     * If a route somehow ended up in your system without being properly bound to an action,
     * you can specify a "rescue" method that will be called.
     * This lets you provide instant user feedback if they click an undefined route.
     *
     * @param {Function} cb - The function to exec for routes without one.
     * @returns {Object}      This chainable object
     */
    rescue: function rescue (cb) {
      _rescue = _fn(cb);
      return this
    },

    enter: function enter (cb) {
      _enter = _fn(cb);
      return this
    },

    exit: function exit (cb) {
      _exit = _fn(cb);
      return this
    },

    get: function get (hash) {
      return _seek(hash, _noop)
    },

    /**
     * Return an object with { ruote, params } for matching route
     *
     * @param   {string} hash - normalized hash
     * @returns {object} `false` if href has not matching route
     */
    match: function match (hash) {
      var aqs = hash.split('?');
      var esc = hash.indexOf('%') < 0 ? _noop : _decode;

      return _query(_seek(aqs[0], esc), aqs[1], esc)
    },

    /**
     * Trigger on hash changes
     *
     * @param   {string}  hash - The hash to run
     * @returns {boolean} success flag
     */
    dispatch: function dispatch (hash) {
      hash = normalize(hash);

      if (_active.hash !== hash) {
        var prev = _active.route;
        var next = this.match(hash);

        // if we have a previous route, call its `exit`
        // method and abort if `exit` returns `false`
        if (prev && prev.exit) {
          if (prev.exit(prev.params) === false) {
            return false
          }
        }

        // continue with the global `exit` routine.
        if (_exit) {
          _exit.call(this, prev);
        }

        // swap the current route info
        _active.hash  = hash;
        _active.route = next;

        // call the global enter routine
        if (_enter) {
          _enter.call(this, next);
        }

        // now, if we have a new route, returns the result
        // of its enter method
        if (next && next.enter) {
          return next.enter(next.params)
        }

        // no route, fallback to rescue
        if (_rescue) {
          _rescue.call(this, hash);
        }
      }

      // no route or the current route has no changes
      return false
    },

    /**
     * Go to the given hash
     *
     * @param   {String}  hash    - The target hash
     * @param   {Boolean} [force] - `true` to always run the callback
     * @returns {Object}  This chainable object
     */
    navigate: function navigate (hash, force) {
      if (force) {
        _active.hash = '@';
      }
      if (force && normalize(location.hash) === normalize(hash)) {
        this.dispatch(hash);
      } else {
        location.hash = hash;
      }
      return this
    },

    /**
     * Default handler for hash changes
     */
    handler: function handler () {
      this.dispatch(location.hash);
    },

    /**
     * This route will be automatically selected on page load.
     *
     * If a user were to land on your page without a route defined, you can
     * force them to use a root route.
     *
     * @param   {string} [root] - The hash used as root
     * @returns {object} This chainable object
     */
    listen: function listen (root) {

      if (!location.hash && root) {
        location.hash = normalize(root);
      }

      if ('onhashchange' in window) {
        window.addEventListener('hashchange', _R.handler, true);
      } else {
        throw new Error('easyRouter: Your browser has no hashchange support')
      }

      if (location.hash) {
        this.dispatch(location.hash);
      }

      return this
    },

  };

  Object.defineProperty(_R, 'version', { values: '0.1.0', enumerable: true });


  return _R.reset()

})(window);

return easyRouter;

})));
