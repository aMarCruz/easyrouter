/* global expect, router, isNode */

describe('Misc', function () {

  var noop = function () {}

  this.beforeAll(function () {
    router.reset().listen()
  })

  this.afterAll(function () {
    router.reset().stop()
  })

  beforeEach(function () {
    expect.restoreSpies()
  })

  it('`clear` removes the routes leaving the context and callback', function () {
    var done = false
    var path = '#/xyz'
    var data = { path: path, enter: noop }

    router.reset().add(data).onEnter(function () { done = true })
    router._run(path)

    var route = router.route(path)
    expect(route).toBeAn('object').toExist()
    expect(route).toInclude({ path: path })
    expect(done).toBe(true, 'onEnter not called')

    router._run('#')
    router.clear()
    done = false
    route = router.route(path)
    expect(route).toBe(null)

    router.add(data)._run(path)
    route = router.route(path)
    expect(route).toBeAn('object').toExist()
    expect(route).toInclude({ path: path })
    expect(done).toBe(true, 'onEnter not called')
  })

  it('`navigate` must change the hash', function () {
    var data = [
      { path: '#/abc' },
      { path: '#/xyz' }
    ]
    var spy = expect.createSpy(noop)

    location.hash = '#/'
    router.reset().add(data, noop).onEnter(spy).listen()

    var hash = data[0].path
    router.navigate(hash)
    expect(location.hash).toBe(hash)
    expect(spy).toHaveBeenCalled()
    spy.reset()

    router.navigate(hash)
    expect(location.hash).toBe(hash)
    expect(spy).toNotHaveBeenCalled()
    spy.reset()

    hash = data[1].path
    router.onEnter(spy).listen().navigate(hash)
    expect(location.hash).toBe(hash)
    expect(spy).toHaveBeenCalled()
  })

  it('`navigate` can force the callback even without changes', function () {
    var hash = '#/abc'
    var spy = expect.createSpy(noop)

    location.hash = '#/'
    router.reset().add({ path: hash }, noop).listen().onEnter(spy)

    router.navigate(hash)
    expect(location.hash).toBe(hash)
    isNode && expect(spy.calls.length).toBe(1)

    router.navigate(hash, true)
    expect(location.hash).toBe(hash)
    isNode && expect(spy.calls.length).toBe(2)

    router.navigate(hash, true)
    expect(location.hash).toBe(hash)
    isNode && expect(spy.calls.length).toBe(3)
  })

  it('`getContext` will retrieve the current router context', function () {
    var path = '#/abc/:id'
    var hash = '#/abc/1'

    router.reset().add({ path: path }, noop).listen().navigate(hash, true)

    if (isNode) {
      var ctx = router.getContext()

      expect(ctx).toBeAn('object').toExist()
      expect(ctx).toInclude({ lastHash: hash, onEnter: undefined })
      expect(ctx.lastRoute).toExist().toInclude({ path: path, hash: hash })
      expect(ctx.lastRoute.params).toExist().toInclude({ id: '1' })
    }
  })

  it('`getContext` lastRoute will be `null` after a reset', function () {
    var path = '#/abc'
    router.reset().add({ path: path }, noop).listen().navigate(path, true)

    if (isNode) {
      var ctx = router.getContext()
      expect(ctx).toBeAn('object').toExist()
      expect(ctx.lastRoute).toExist().toInclude({ hash: path })

      router.reset()
      ctx = router.getContext()
      expect(ctx).toBeAn('object').toExist()
      expect(ctx.lastRoute).toBe(null)
    }
  })

})
