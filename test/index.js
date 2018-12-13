/* eslint-disable no-unused-expressions */

// Fake window
if (typeof global.window != 'object') {

  const EVT = 'hashchange'
  var _cb = null
  var _href = ''
  var _hash = ''

  var window = global.window = {
    location: {
      set href (value) {
        const ix = value.indexOf('#')
        _href = value

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
      }
    }
  }

  Object.defineProperties(window, {
    addEventListener: {
      value: (evt, cb) => {
        if (evt === EVT) { _cb = cb }
      },
      configurable: true
    },
    removeEventListener: {
      value: (evt) => {
        if (evt === EVT) { _cb = null }
      },
      configurable: true
    },
    onhashchange: {
      get () {
        return _cb
      },
      set (cb) {
        cb ? this.addEventListener(EVT, cb) : this.removeEventListener(EVT, cb)
      },
      configurable: true
    }
  })

  Object.defineProperties(window.location, {
    toString: {
      value: () => _href,
      configurable: true
    }
  })

  global.location = window.location
  window.location.href = 'https://nowhere.com#/none'
}

global.expect = require('expect')
global.router = require('../')

require('./00-initialization.js')
require('./01-normalize.js')
require('./02-match.js')
require('./04-add-and-route.js')
require('./05-run.js')
require('./06-misc.js')
require('./08-router-callbacks.js')
