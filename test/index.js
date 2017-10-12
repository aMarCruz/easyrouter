var expect = require('expect')
var router = require('../')

describe('normalize', function () {

  var normalize = router._normalize

  it('must convert empty hash to `#`', function () {
    expect(normalize('')).toBe('#')
  })

  it('must leave an onlone pound sign as-is', function () {
    expect(normalize('#')).toBe('#')
  })

  it('must convert an alone slash to root (`#/`)', function () {
    expect(normalize('/')).toBe('#/')
  })

  it('must add missing `#` in front the hash', function () {
    expect(normalize('f')).toBe('#f')
    expect(normalize('f/')).toBe('#f')
    expect(normalize('foo')).toBe('#foo')
    expect(normalize('foo/')).toBe('#foo')
    expect(normalize('foo/bar')).toBe('#foo/bar')
  })

  it('must add `#` in front of hashes starting with `/`', function () {
    expect(normalize('/f')).toBe('#/f')
    expect(normalize('/f/')).toBe('#/f')
    expect(normalize('/foo')).toBe('#/foo')
    expect(normalize('/foo/')).toBe('#/foo')
    expect(normalize('/foo/bar')).toBe('#/foo/bar')
  })

  it('must remove the last slash, except for root', function () {
    expect(normalize('#/')).toBe('#/')
    expect(normalize('#/f/')).toBe('#/f')
    expect(normalize('#/foo/')).toBe('#/foo')
    expect(normalize('#/foo/bar/')).toBe('#/foo/bar')
    expect(normalize('#f/')).toBe('#f')
    expect(normalize('#foo/')).toBe('#foo')
    expect(normalize('#foo/bar/')).toBe('#foo/bar')
  })

  it('must do nothing for correct hashes', function () {
    expect(normalize('#f')).toBe('#f')
    expect(normalize('#foo')).toBe('#foo')
    expect(normalize('#foo/bar')).toBe('#foo/bar')
    expect(normalize('#/f')).toBe('#/f')
    expect(normalize('#/foo')).toBe('#/foo')
    expect(normalize('#/foo/bar')).toBe('#/foo/bar')
  })

})


describe('match', function () {
  var routes = [
    {
      path: '#/recursos',
      title: 'Recursos'
    }, {
      path: '#/recurso/:id',
      title: 'Recursos'
    }, {
      path: '#/recurso/:id/editar',
      title: 'Recursos'
    }, {
      path: '#/recurso/nuevo',
      title: 'Recursos'
    }
  ]
  router.clear()
  router.concat(routes)

  it('must find exact plain routes', function () {
    var hash = routes[0].path
    var result = router.match(hash)
    expect(result).toBeAn('object')
    expect(result.path).toBe(hash)
  })

  it('returns empty params for parameterless routes', function () {
    var hash = routes[3].path
    var result = router.match(hash)
    expect(result).toBeAn('object')
    expect(result.path).toBe(hash)
    expect(result.params).toEqual({})
  })

  it('must find plain routes that looks as params first', function () {
    var hash = routes[3].path
    var result = router.match(hash)
    expect(result).toBeAn('object')
    expect(result.path).toBe(hash)
    expect(result.params).toEqual({})
  })

  it('...and fallback to other with parms', function () {
    var hash = routes[1].path
    var result = router.match(hash.replace(':id', 5))
    expect(result).toBeAn('object')
    expect(result.path).toBe(hash)
    expect(result.params.id).toEqual(5)
  })

  it('...or return `undefined` if none match', function () {
    var hash = '@'
    var result = router.match(hash)
    expect(result).toBe(undefined)
  })

  it('must find parms in the middle of the hash', function () {
    var hash = routes[2].path
    var result = router.match(hash.replace(':id', 5))
    expect(result).toBeAn('object').toNotBe(null)
    expect(result.path).toBe(hash)
    expect(result.params.id).toEqual(5)
  })
})


describe('`_run`', function () {
  var routes = [
    {
      path: '#/recursos',
      title: 'Recurso'
    }, {
      path: '#/recurso/:id',
      title: 'Editar recurso',
    }, {
      path: '#/recurso/:id/editar/:foo/bar',
      title: 'Editar recurso'
    }, {
      path: '#/recurso/nuevo',
      title: 'Nuevo recurso'
    }, {
      path: '#/recurso/ext/*',
      title: 'Otro recurso'
    }, {
      path: '#/recurso/:id/ext/*',
      title: 'Otro recurso'
    }
  ]

  afterEach(function () {
    expect.restoreSpies()
  })

  it('must call action with `this.path` set to the rule', function () {
    var hash = routes[0].path

    router.add(routes[0], function () {
      expect(this.path).toBe(hash)
    })

    var route = router.route(hash)
    expect(route).toBeAn('object')
    var spy = expect.spyOn(route, 'enter')

    var result = router._run(hash)
    expect(result).toNotBe(false)
    expect(spy).toHaveBeenCalled()

    var ctx = spy.calls[0].context
    expect(typeof ctx).toBe('object')
    expect(ctx.path).toBe(route.path)
    expect(ctx.title).toBe(route.title)
  })

  it('must call action once for the same rule', function () {
    var hash = routes[0].path

    router.add(routes[0], function () {
      throw new Error('This must be not called')
    })

    var result = router._run(hash)
    expect(result).toBe(false)
  })

  it('must preserve custom data', function () {
    var elem = routes[3]
    var hash = elem.path

    router.add(elem, function () {
      expect(this.path).toBe(hash)
      expect(this.title).toBe(elem.title)
    })

    var route = router.route(hash)
    expect(route).toBeAn('object')
    var spy = expect.spyOn(route, 'enter')

    var result = router._run(hash)
    expect(result).toNotBe(false)
    expect(spy).toHaveBeenCalled()
  })

  it('must take the correct parameter', function () {
    var elem = routes[1]
    var hash = elem.path

    router.add(elem, function () {
      expect(this.path).toBe(hash)
    })

    var route = router.route(hash)
    expect(route).toBeAn('object')
    var spy = expect.spyOn(route, 'enter')

    var result = router._run(hash.replace(':id', 5))
    expect(result).toNotBe(false)
    expect(spy).toHaveBeenCalledWith({ id: '5' })
  })

  it('must take more than one parameter', function () {
    var elem = routes[2]
    var hash = elem.path

    router.add(elem, function () {
      expect(this.path).toBe(hash)
    })

    var route = router.route(hash)
    expect(route).toBeAn('object')
    var spy = expect.spyOn(route, 'enter')

    var result = router._run(hash.replace(':id', 5).replace(':foo', 'bar'))
    expect(result).toNotBe(false)
    expect(spy).toHaveBeenCalledWith({ id: '5', foo: 'bar' })
  })

  it('must match routes ending with `*`', function () {
    var elem = routes[4]
    var hash = elem.path

    router.add(elem, function () {
      expect(this.path).toBe(hash)
    })

    var route = router.route(hash)
    expect(route).toBeAn('object')
    var spy = expect.spyOn(route, 'enter')

    var result = router._run(hash.replace('/*', '/foo/bar'))
    expect(result).toNotBe(false)
    expect(spy).toHaveBeenCalled()
  })

  it('must match routes with params ending with `*`', function () {
    var elem = routes[5]
    var hash = elem.path

    router.add(elem, function () {
      expect(this.path).toBe(hash)
    })

    var route = router.route(hash)
    expect(route).toBeAn('object')

    var spy = expect.spyOn(route, 'enter')

    var result = router._run(hash.replace(':id', 5).replace('/*', '/foo/bar'))
    expect(result).toNotBe(false)
    expect(spy).toHaveBeenCalledWith({ id: '5' })
  })

  it('must call `rescue` with current hash for non-existing routes', function () {
    var hash = '#/abcedef'
    var done = ''

    router.rescue(function (href) {
      done = '404'
      expect(href).toBe(hash)
    })

    var result = router._run(hash)
    expect(result).toBe(false)
    expect(done).toBe('404')
  })

})

describe('route', function () {
  var routes = [
    {
      path: '#/recursos',
      title: 'Recursos'
    }, {
      path: '#/recurso/:id',
      title: 'Recursos'
    }, {
      path: '#/recurso/:id/editar',
      title: 'Recursos'
    }, {
      path: '#/recurso/*/nuevo',
      title: 'Recursos'
    }, {
      path: '#/recurso/nuevo/*',
      title: 'Recursos'
    }, {
      path: '#/',
      title: 'Home'
    }
  ]
  router.concat(routes)

  it('must find exact plain routes', function () {
    for (var i = 0; i < routes.length; i++) {
      var hash = routes[0].path
      var result = router.route(hash)
      expect(result).toBeAn('object')
      expect(result.path).toBe(hash)
    }
  })

})
