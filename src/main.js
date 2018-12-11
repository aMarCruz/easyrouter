/*#if process.env.BUILD === 'test'
var window
if (typeof window != 'object') window = {}
if (!window.location) window.location = { hash: '' }
//#endif */

const router = (function easyRouter (window, UNDEF) {

  const location = window.location
  const _decode  = window.decodeURIComponent

  const _noop = (s) => s

  const _active = {}
  let _routes = {}
  let _rescue
  let _enter
  let _exit

  function _fn (fn) {
    return typeof fn == 'function' ? fn : UNDEF
  }

  /**
   * Hash normalization, adds the first '#' and removes the last slash.
   *
   * @param   {String} hash - The hash to normalize
   * @returns {String} Normalized hash.
   * @private
   */
  function normalize (hash) {

    // if the hash is empty, this will output the '#' alone
    if (hash[0] !== '#') {
      hash = `#${hash}`
    }

    // only removing if length > 2 (allows '#/' alone)
    return hash.length > 2 && hash.slice(-1) === '/'
      ? hash.slice(0, -1) : hash
  }

  /**
   * Makes a shallow copy of `src`.
   * Returns `null` if `src` is falsy.
   *
   * @param   {Object|null} src - Source object
   * @returns {Object|null} New object with the properties of `src`.
   */
  function _dup (src) {
    if (!src) {
      return null
    }

    const dest = Object.create(null)
    Object.keys(src).forEach(function (prop) { this[prop] = src[prop] }, dest)
    return dest
  }

  /**
   * Remove the first '#/' and trailing slashes from the given hash
   * and returns it parts.
   *
   * @param   {string} hash - Hash to split
   * @returns {string[]} Separate components of the hash
   * @private
   */
  function _split (hash) {
    return hash
      .replace(/^#?\/*(.*)\/*$/, '$1')
      .toLowerCase()
      .split('/')
  }

  /**
   * Determinate if two route paths have the same params.
   *
   * @param  {Object} a - Route
   * @param  {Object} b - Route
   * @return {boolean}
   */
  function _equ (a, b) {
    if (a.path !== b.path) {
      return false
    }

    const parms = a.path.split('/').filter((p) => p[0] === ':')

    for (let i = 0; i < parms.length; i++) {
      const p = parms[i].substr(1)

      if (a.params[p] !== b.params[p]) {
        return false
      }
    }
    return true
  }

  /**
   * Find the route which the given hash belongs to.
   *
   * @param   {string} hash     - Already normalized hash
   * @param   {Function} unesc  - Decoding function
   * @returns {Object}
   */
  function _seek (hash, unesc) {
    const parts  = _split(hash)
    const params = {}
    let route = _routes

    for (let i = 0; i < parts.length; i++) {
      const part = unesc(parts[i])
      const name = part in route ? part : ':' in route ? ':' : '*'

      route = route[name]
      if (!route) {
        return UNDEF
      }
      if (name === '*') {
        break
      }
      if (route['~']) {
        params[route['~']] = part
      }
    }

    route = _dup(route['@'])
    route.params = params
    return route
  }

  /**
   * Parses the queryString part.
   *
   * @param {Object} route    - Route object
   * @param {string} queryStr - Query string
   * @param {string} unesc    - Decoding function
   * @returns {Object} The route
   */
  function _query (route, queryStr, unesc) {
    if (queryStr && route) {
      const qs = queryStr.split('&')

      for (let i = 0; i < qs.length; i++) {
        const pair = qs[i].split('=')

        route.params[pair[0]] = unesc(pair[1])
      }
    }
    return route
  }

  /*
    Main method to define a new route.
   */
  function _add (src, cb) {
    const path = normalize(src.path)
    let route = _routes

    _split(path).forEach((part) => {
      const parm = part[0] === ':' ? ':' : 0
      const name = parm || part

      route = route[name] || (route[name] = {})
      if (parm) { route['~'] = part.slice(1) }
    })

    route = route['@'] = { enter: cb }

    if (src) {
      Object.keys(src).forEach((p) => {
        route[p] = p === 'path' ? path : src[p]
      })
    }
    return route
  }


  const _R = {

    /**
     * Reset the router to their predefined values
     *
     * @returns {object} This chainable object
     */
    reset () {
      this.clear()
      _active.hash  = ''
      _active.route = _rescue = _enter = _exit = UNDEF
      return this
    },

    clear () {
      _routes = {}
      return this
    },

    /**
     * Allows to define one or more routes.
     *
     * @param   {Array}    arr  - Array of templates for the routes
     * @param   {Function} [cb] - Optional 'on' function
     * @returns {Object}   This chainable object
     */
    concat (arr, cb) {
      cb = _fn(cb)

      if (Array.isArray(arr)) {
        arr.forEach((src) => { _add(src, cb) })
      } else {
        _add(arr, cb)
      }
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
    rescue (cb) {
      _rescue = _fn(cb)
      return this
    },

    enter (cb) {
      _enter = _fn(cb)
      return this
    },

    exit (cb) {
      _exit = _fn(cb)
      return this
    },

    route (hash) {
      const parts = _split(normalize(hash))
      let route = _routes

      for (let i = 0; i < parts.length; i++) {
        const part = parts[i]

        route = route[part[0] === ':' ? ':' : part]
        if (!route) {
          return UNDEF
        }
      }

      return route['@']
    },

    /**
     * Returns an object with { ruote, params } for matching route
     *
     * @param   {string} hash - normalized hash
     * @returns {object} `false` if href has not matching route
     */
    match (hash) {
      const parts = hash.split('?')
      const unesc = hash.indexOf('%') < 0 ? _noop : _decode

      return _query(_seek(parts[0], unesc), parts[1], unesc)
    },

    /**
     * Trigged on hash changes.
     *
     * @param   {string}  hash - The hash to run
     * @returns {boolean} success flag
     */
    _run (hash) {   // eslint-disable-line max-lines-per-function, complexity
      hash = normalize(hash)

      if (_active.hash !== hash) {
        const prev = _active.route
        const next = this.match(hash)

        // Hook for query-string only changes through the `query` method of
        // the route.
        if (next) {
          next.hash = hash

          // run the query function if any, and only if we have the same
          // params for the non-queryStr parts (route already loaded)
          if (next.query && prev && _equ(prev, next) &&
              next.query.call(this, next.params) === false) {
            _active.hash  = hash
            _active.route = next
            return false
          }
        }

        // if we have a previous route, call its `exit`
        // method and abort if `exit` returns `false`
        if (prev && prev.exit && prev.exit() === false) {
          return false
        }

        // continue with the global `exit` routine.
        if (_exit) {
          _exit.call(this, prev)
        }

        // swap the current route info
        _active.hash  = hash
        _active.route = next

        // call the global enter routine
        if (_enter) {
          _enter.call(this, next)
        }

        // if we have a new route with a `next` method, call it and return
        if (next && next.enter) {
          next.enter(next.params)
          return true
        }

        // no route, fallback to rescue
        if (_rescue) {
          _rescue.call(this, hash)
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
    navigate (hash, force) {
      if (force) {
        _active.hash = '@'
      }
      if (force && normalize(location.hash) === normalize(hash)) {
        this._run(hash)
      } else {
        location.hash = hash
      }
      return this
    },

    get _routes () {
      return _routes
    },

    /**
     * Default handler for hash changes
     */
    _handler () {
      _R._run(location.hash)
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
    listen (root) {

      // check browser haschange support
      if ('onhashchange' in window) {
        window.addEventListener('hashchange', _R._handler, true)
      } else {
        throw new Error('easyRouter: Your browser has no hashchange support')
      }

      // normalize root
      if (root) {
        root = normalize(root)

        // set a default rescue funtion if there's no one
        if (!_rescue) {
          _rescue = () => { location.hash = root }
        }
      }

      // if we have a hash, run it
      if (location.hash) {
        this._run(location.hash)

      // else if we have a root, set it (it will run automatically)
      } else if (root) {
        location.hash = root
      }

      return this
    },

  }

  // aliases
  _R.add = _R.concat

  //#if process.env.BUILD === 'test'
  _R._split = _split
  _R._normalize = normalize
  //#endif

  return _R.reset()

})(window)

export default router
