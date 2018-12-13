/* global expect, router */

describe('Router callbacks', function () {

  this.beforeAll(function () {
    expect(router.reset().listen()).toBe(router)
  })

  this.afterAll(function () {
    expect(router.reset().stop()).toBe(router)
  })

  beforeEach(function () {
    router.reset()
    expect.restoreSpies()
  })

  it('must call the `onEnter` method when entering a route', function () {
    var data = [
      {
        path: '#/abc/:x'
      },
      {
        path: '#/xyz/:x'
      }
    ]
    var spy = expect.createSpy(function () {})

    router.add(data).onEnter(spy)

    var hash = data[0].path.replace(':x', '0')
    location.hash = hash
    expect(spy.calls.length).toBe(1)

    hash = data[0].path.replace(':x', '1')
    location.hash = hash
    expect(spy.calls.length).toBe(2)

    location.hash = hash
    expect(spy.calls.length).toBe(2)

    // with the previous '1', route.exit returns `false` and router.onExit
    // will be not called
    hash = data[1].path.replace(':x', '1')
    location.hash = hash
    expect(spy.calls.length).toBe(3)
  })

  it('must call `rescue` with current hash for non-existing routes', function () {
    var hash = '#/abcedef'
    var url = ''

    router.rescue(function (href) {
      url = '404.html'
      expect(href).toBe(hash)
    })

    location.hash = hash
    expect(url).toBe('404.html')
  })

})
