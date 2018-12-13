/* global expect, router */

describe('Initialization', () => {

  it('must start with the `listen` method', function () {
    var noop = function () {}
    var data = [
      { path: '#/abc' },
      { path: '#/xyz' },
      { path: '#/123' }
    ]
    location.hash = ''

    // can't spy `_run`, so use `onEnter`, and set rescue to noop
    // to avoid interference.
    const spy = expect.createSpy(function () {})

    router.reset().add(data, noop).onEnter(spy).rescue(noop)

    expect(router.stop()).toBe(router)
    location.hash = '#/xyz'
    expect(spy.calls.length).toBe(0)

    location.hash = '' // will set the root

    // `listen` will make a first call
    expect(router.listen('#/123')).toBe(router)
    expect(spy.calls.length).toBe(1)
    expect(location.hash).toMatch(/123$/)

    location.hash = '#/abc'
    expect(spy.calls.length).toBe(2)

    expect(router.stop()).toBe(router)
    location.hash = '#/123'
    expect(spy.calls.length).toBe(2)
  })

})
