/* eslint-disable no-unused-expressions */

var _g = typeof window !== 'undefined' && window.self === window ? window : global

_g.isNode = !(_g.self && _g.self.location && _g.self.location.href)

// Fake window
if (_g.isNode) {

  const EVT = 'hashchange'
  var _cb = null
  var _href = ''
  var _hash = ''

  _g.window = {
    location: {
      set href (value) {
        const ix = value.indexOf('#')
        ix !== 0 && (_href = value)    // accept href = "#foo"
        value = ~ix ? value.slice(ix) : ''
        this.hash = value
      },
      get href () {
        return _href
      },

      set hash (value) {
        value = value ? String(value) : ''
        value && value[0] !== '#' && (value = '#' + value)

        if (_hash !== value) {
          const ix = _href.indexOf('#')
          ~ix && (_href = _href.slice(0, ix))
          _href += value
          _hash = value
          _cb && _cb(_hash)
        }
      },
      get hash () {
        return _hash
      },
    },
  }

  Object.defineProperties(_g.window, {
    addEventListener: {
      value: (evt, cb) => {
        if (evt === EVT) { _cb = cb }
      },
      configurable: true,
    },
    removeEventListener: {
      value: (evt) => {
        if (evt === EVT) { _cb = null }
      },
      configurable: true,
    },
    onhashchange: {
      get () {
        return _cb
      },
      set (cb) {
        cb ? this.addEventListener(EVT, cb) : this.removeEventListener(EVT, cb)
      },
      configurable: true,
    },
  })

  Object.defineProperties(_g.window.location, {
    toString: {
      value: () => _href,
      configurable: true,
    },
  })

  _g.location = _g.window.location
  _g.window.location.href = 'https://nowhere.com#/none'
}

_g.expect = require('expect')
_g.router = require('../')

require('./00-initialization.js')
require('./01-normalize.js')
require('./02-match.js')
require('./04-add-and-route.js')
require('./05-run.js')
require('./06-misc.js')
require('./08-router-callbacks.js')
