/* global expect, router */

describe('The hashchange handler (`_run`)', function () {

  beforeEach(function () {
    router.reset()
    expect.restoreSpies()
  })

  it('must run the `enter` callback with the route as context', function () {
    var rule = '#/recurso/:id'
    var hash = rule.replace(':id', '5')
    var data = {
      path: rule,
      title: 'Recurso'
    }

    router.add(data, function () {
      expect(this.path).toBe(rule)
      expect(this.title).toBe(data.title)
      expect(this.params).toEqual({ id: '5' })
    })

    var route = router.route(rule)
    expect(route).toBeAn('object').toExist()
    expect(route).toInclude({ path: rule })
    expect(route.enter).toBeA('function')

    var spy = expect.spyOn(route, 'enter')

    var result = router._run(hash)
    expect(result).toNotBe(false)
    expect(spy).toHaveBeenCalled()

    var ctx = spy.calls[0].context
    expect(ctx).toBeAn('object').toExist()
    expect(ctx).toInclude({ path: rule, hash: hash, title: data.title })
  })

  it('must call `enter` with the correct parameters', function () {
    var rule = '#/recurso/:id'
    var hash = rule.replace(':id', '5')
    var data = {
      path: rule,
      enter: function (parms) {
        expect(this.hash).toBe(hash)
        expect(parms).toEqual({ id: '5' })
      }
    }
    router.add(data)

    var route = router.route(rule)
    expect(route).toBeAn('object').toExist()
    var spy = expect.spyOn(route, 'enter')

    var result = router._run(hash)
    expect(result).toNotBe(false)
    expect(spy).toHaveBeenCalledWith({ id: '5' })
  })

  it('must call `enter` once for the same rule', function () {
    var rule = '#/abc'
    var count = 0

    router.add({ path: rule }, function () {
      count++
    })
    for (var i = 0; i < 3; i++) {
      router._run(rule)
    }

    expect(count).toBe(1)
  })

  it('must preserve custom data', function () {
    var rule = '#/abc/xyz'
    var data = {
      path: rule,
      custdata: { a: 1 }
    }

    router.add(data, function () {
      expect(this.path).toBe(rule)
      expect(this.custdata).toBe({ a: 1 })
    })

    var route = router.route(rule)
    expect(route).toBeAn('object').toExist()
    var spy = expect.spyOn(route, 'enter')

    var result = router._run(rule)
    expect(result).toNotBe(false)
    expect(spy).toHaveBeenCalled()
  })

  it('route methods can take more than one parameter', function () {
    var rule = '#/recurso/:id/editar/:foo/bar'
    var hash = rule.replace(':id', 5).replace(':foo', 'Foo')

    router.add({ path: rule }, function () {
      expect(this.hash).toBe(hash)
    })

    var route = router.route(rule)
    expect(route).toBeAn('object').toExist()
    var spy = expect.spyOn(route, 'enter')

    var result = router._run(hash)
    expect(result).toNotBe(false)
    expect(spy).toHaveBeenCalledWith({ id: '5', foo: 'Foo' })
  })

  it('must match partially rules ending with `*`', function () {
    var rule = '#/recurso/ext/*'
    var hash = rule.replace('/*', '/foo/bar')

    router.add({ path: rule }, function () {
      expect(this.path).toBe(rule)
      expect(this.hash).toBe(hash)
    })

    var route = router.route(rule)
    expect(route).toBeAn('object').toExist()
    var spy = expect.spyOn(route, 'enter')

    var result = router._run(hash)
    expect(result).toNotBe(false)
    expect(spy).toHaveBeenCalled()
  })

  it('must match routes with params ending with `*`', function () {
    var rule = '#/recurso/:id/ext/:name/*'
    var hash = rule.replace(':id', 1).replace(':name', 'foo').replace('/*', '/bar')

    router.add({ path: rule }, function () {
      expect(this.path).toBe(rule)
      expect(this.hash).toBe(hash)
    })

    var route = router.route(rule)
    expect(route).toBeAn('object').toExist()
    var spy = expect.spyOn(route, 'enter')

    var result = router._run(hash)
    expect(result).toNotBe(false)
    expect(spy).toHaveBeenCalledWith({ id: '1', name: 'foo' })
  })

  it('must discard hash that has no rule for it', function () {
    var rule = '#/recurso'
    var hash = rule + '/5'

    router.reset().add({ path: rule }, function () {
      expect(this.path).toBe(rule)
    })

    var route = router.route(rule)
    expect(route).toBeAn('object').toExist()
    var spy = expect.spyOn(route, 'enter')

    var result = router._run(hash)
    expect(result).toBe(false)
    expect(spy).toNotHaveBeenCalled()
  })

  it('must call `query` for queryString-only changes', function () {
    var rule  = '#abcpath/:abc'
    var data = {
      path: rule,
      query: () => {}
    }
    router.reset().add(data)

    var route = router.route(rule)
    expect(route).toBeAn('object').toExist()
    expect(route).toIncludeKey('query')
    var spy = expect.spyOn(route, 'query')

    // First _run will not call query
    var hash = rule.replace('/:abc', '/1')
    router._run(hash)

    router._run(hash + '?xyz=5')
    expect(spy.calls.length).toBe(1)
    expect(spy).toHaveBeenCalledWith({ abc: '1', xyz: '5' })

    router._run(hash + '?xyz=6')
    expect(spy.calls.length).toBe(2)
    expect(spy).toHaveBeenCalledWith({ abc: '1', xyz: '6' })

    // clear the spy
    spy.reset()
    expect(spy.calls.length).toBe(0)

    hash = rule.replace('/:abc', '/2')
    router._run(hash + '?xyz=7')
    expect(spy).toNotHaveBeenCalled()
  })

  it('must not call `query` if the rule changed', function () {
    var rule1 = '#abcpath/:abc'
    var rule2 = '#xyzpath/:abc'
    var data = [
      {
        path: rule1,
        query: () => {}
      },
      {
        path: rule2,
        query: () => {}
      }
    ]
    router.reset().add(data)

    var route1 = router.route(rule1)
    expect(route1).toBeAn('object').toExist()
    expect(route1).toIncludeKey('query')
    var spy1 = expect.spyOn(route1, 'query')

    var route2 = router.route(rule2)
    expect(route2).toBeAn('object').toExist()
    expect(route2).toIncludeKey('query')
    var spy2 = expect.spyOn(route2, 'query')

    // First _run will not call query
    var hash = rule1.replace('/:abc', '/1')
    router._run(hash + '?xyz=4')

    router._run(hash + '?xyz=5')
    expect(spy1.calls.length).toBe(1)
    expect(spy1).toHaveBeenCalledWith({ abc: '1', xyz: '5' })
    expect(spy2).toNotHaveBeenCalled()

    spy1.reset()
    expect(spy1.calls.length).toBe(0)

    // now call with the same parameters, different rule
    hash = rule2.replace('/:abc', '/1')
    router._run(hash + '?xyz=5')
    expect(spy1).toNotHaveBeenCalled()
    expect(spy2).toNotHaveBeenCalled()
  })

  it('must skip other methods if `query` returns false', function () {
    var rule = '#abcpath/:abc'
    var data = {
      path: rule,
      query: function () { return false },
      enter: function () {},
      exit: function () {}
    }
    router.reset().add(data)

    var route = router.route(rule)
    expect(route).toBeAn('object').toExist()
    expect(route).toIncludeKeys(['query', 'enter', 'exit'])

    var spy1 = expect.spyOn(route, 'query').andCall(data.query)
    var spy2 = expect.spyOn(route, 'enter')
    var spy3 = expect.spyOn(route, 'exit')

    // First _run will not call query
    var hash = rule.replace('/:abc', '/0')
    router._run(hash)
    expect(spy1).toNotHaveBeenCalled()
    expect(spy2).toHaveBeenCalledWith({ abc: '0' })
    expect(spy3).toNotHaveBeenCalled()

    // will call enter and exit, but not to query
    hash = rule.replace('/:abc', '/1')
    router._run(hash)
    expect(spy1).toNotHaveBeenCalled()
    expect(spy2).toHaveBeenCalledWith({ abc: '1' })
    expect(spy3).toHaveBeenCalled()

    // reset 'enter' and 'exit'
    spy2.reset()
    spy3.reset()
    expect(spy2.calls.length).toBe(0)
    expect(spy3.calls.length).toBe(0)

    // run query returning `false`
    router._run(hash + '?xyz=5')
    expect(spy1).toHaveBeenCalledWith({ abc: '1', xyz: '5' })
    expect(spy2).toNotHaveBeenCalled()
    expect(spy3).toNotHaveBeenCalled()

    router._run(hash + '?xyz=6')
    expect(spy1.calls.length).toBe(2)
    expect(spy1).toHaveBeenCalledWith({ abc: '1', xyz: '6' })
    expect(spy2).toNotHaveBeenCalled()
    expect(spy3).toNotHaveBeenCalled()
  })

  it('must call the `exit` method when leaving a route', function () {
    var rule = '#abcpath/:abc'
    var data = {
      path: rule,
      exit: function (p) { return +p.abc < 1 }
    }
    var spy2 = expect.createSpy(function () {})

    router.reset().add(data).onExit(spy2)

    var route = router.route(rule)
    expect(route).toBeAn('object').toExist()
    expect(route.exit).toBeA('function')

    var spy1 = expect.spyOn(route, 'exit').andCall(data.exit)

    // first _run with "0" must not call the route.exit method
    var hash = rule.replace(':abc', '0')
    router._run(hash)
    expect(spy1).toNotHaveBeenCalled()
    expect(spy2).toHaveBeenCalled()
    spy2.reset()

    // second call with another hash will call both methods
    hash = rule.replace(':abc', '1')
    router._run(hash)
    expect(spy1).toHaveBeenCalledWith({ abc: '0' })
    expect(spy2).toHaveBeenCalled()

    // reset both methods
    spy1.reset()
    spy2.reset()
    expect(spy1.calls.length).toBe(0)
    expect(spy2.calls.length).toBe(0)

    // with the previous '1', route.exit returns `false` and router.onExit
    // will be not called
    hash = rule.replace(':abc', '2')
    router._run(hash)
    expect(spy1).toHaveBeenCalledWith({ abc: '1' })
    expect(spy2).toNotHaveBeenCalled()
  })

})
