/* global expect, router, isNode */

/*
  Changing the hash in the browser makes the __counter test fail,
  so we skip it checking window.Mocha
*/
if (typeof isNode !== 'boolean') {
  window.isNode = false
}

describe('Initialization', () => {

  it('must start with the `listen` method', function () {
    var noop = function () {}
    var data = [
      { path: '#/abc' },
      { path: '#/xyz' },
      { path: '#/123' }
    ]
    // can't spy `_run`, so use `onEnter`, and set rescue to noop
    // to avoid interference.
    var __count = 0
    const spy = function () {
      __count++
    }

    expect(router.stop()).toBe(router)
    router.reset().add(data, noop).rescue(noop).onEnter(spy)

    location.hash = '#/xyz'
    location.hash = '' // "listen" will set the root to /123
    expect(__count).toBe(0)

    // `listen` will make a first call
    router.listen('#/123')
    expect(location.hash).toMatch(/123$/)
    isNode && expect(__count).toBe(1)

    location.hash = '#/abc'
    isNode && expect(__count).toBe(2)
    router.stop()

    __count = 0
    location.hash = '#/xyz'
    expect(__count).toBe(0)
  })

})
