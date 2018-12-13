/* global expect, router */

describe('Misc', function () {

  this.beforeAll(function () {
    router.reset().listen()
  })

  this.afterAll(function () {
    router.reset().stop()
  })

  beforeEach(function () {
    router.reset()
    expect.restoreSpies()
  })

  it('`clear` removes the routes leaving the context and callback', function () {
    var noop = function () {}
    var done = false
    var path = '#/xyz'
    var data = { path: path, enter: noop }

    router.add(data).onEnter(function () { done = true })
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
    var spy = expect.createSpy(function () {})

    location.hash = '#/'
    router.add(data).onEnter(spy)

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
    router.navigate(hash)
    expect(location.hash).toBe(hash)
    expect(spy).toHaveBeenCalled()
  })

  it('`navigate` can force the callback even without changes', function () {
    var hash = '#/abc'
    var spy = expect.createSpy(function () {})

    location.hash = '#/'
    router.add({ path: hash }, function () {}).onEnter(spy)

    router.navigate(hash)
    expect(location.hash).toBe(hash)
    expect(spy.calls.length).toBe(1)

    router.navigate(hash, true)
    expect(location.hash).toBe(hash)
    expect(spy.calls.length).toBe(2)

    router.navigate(hash, true)
    expect(location.hash).toBe(hash)
    expect(spy.calls.length).toBe(3)
  })

  it('`getContext` will retrieve the current route context', function () {
    var path = '#/abc/:id'
    var hash = '#/abc/1'
    router.reset().add({ path: path }).navigate(hash, true)

    var route = router.getContext()
    expect(route).toBeAn('object').toExist()
    expect(route).toInclude({ path: path, hash: hash })
    expect(route.params).toExist().toInclude({ id: '1' })
  })

  it('`getContext` will return `null` after a reset', function () {
    var path = '#/abc'
    router.reset().add({ path: path }).navigate(path, true)

    var route = router.getContext()
    expect(route).toBeAn('object').toExist()

    router.reset()
    route = router.getContext()
    expect(route).toBe(null)
  })

})
