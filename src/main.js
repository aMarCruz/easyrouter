/**
 * easyRouter v$_VERSION
 * @author aMarCruz
 * @license MIT
 */
import normalize from './normalize'

/*#if process.env.BUILD === 'test'
var window
if (typeof window != 'object') window = {}
if (!window.location) window.location = { hash: '' }
//#endif */

const easyRouter = (function _easyRouter (window, UNDEF) {
  'use strict'

  const location = window.location
  const _decode = decodeURIComponent
  const _noop = (s) => s

  const _routes = {}
  const _active = {}
  let _rescue
  let _enter
  let _exit

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
    const parts  = _split(hash)
    const params = {}
    let route = _routes

    for (let i = 0; i < parts.length; i++) {
      const part = esc(parts[i])
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

    (route = route['@']).params = params
    return route
  }

  function _query (ctx, url, esc) {
    if (url && ctx) {
      const qs = url.split('&')

      for (let i = 0; i < qs.length; i++) {
        const pair = qs[i].split('=')

        ctx.params[pair[0]] = esc(pair[1])
      }
    }
    return ctx
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
      if (parm) route['~'] = part.slice(1)
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
      Object.keys(_routes).forEach((p) => { delete _routes[p] })
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

    get (hash) {
      return _seek(hash, _noop)
    },

    /**
     * Returns an object with { ruote, params } for matching route
     *
     * @param   {string} hash - normalized hash
     * @returns {object} `false` if href has not matching route
     */
    match (hash) {
      const aqs = hash.split('?')
      const esc = hash.indexOf('%') < 0 ? _noop : _decode

      return _query(_seek(aqs[0], esc), aqs[1], esc)
    },

    /**
     * Trigger on hash changes
     *
     * @param   {string}  hash - The hash to run
     * @returns {boolean} success flag
     */
    _run (hash) {
      hash = normalize(hash)

      if (_active.hash !== hash) {
        const prev = _active.route
        const next = this.match(hash)

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
        next.hash = hash
        _active.hash  = hash
        _active.route = next

        // call the global enter routine
        if (_enter) {
          _enter.call(this, next)
        }

        // now, if we have a new route, returns the result
        // of its enter method
        if (next && next.enter) {
          return next.enter(next.params)
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

      if (!location.hash && root) {
        location.hash = normalize(root)
      }

      if ('onhashchange' in window) {
        window.addEventListener('hashchange', _R._handler, true)
      } else {
        throw new Error('easyRouter: Your browser has no hashchange support')
      }

      if (location.hash) {
        this._run(location.hash)
      }

      return this
    },

  }

  Object.defineProperty(_R, 'version', { values: '$_VERSION', enumerable: true })
  _R.add = _R.concat

  //#if process.env.BUILD === 'test'
  _R._split = _split
  _R._normalize = normalize
  //#endif

  return _R.reset()

})(window)

export default easyRouter
