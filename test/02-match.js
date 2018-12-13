/* global expect, router */

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

  beforeEach(function () {
    router.reset()
    router.add(routes)
  })

  it('must find the correct route, ignoring its case', function () {
    var path = routes[0].path
    var hash = path.toUpperCase()
    var result = router.match(hash)

    expect(result).toBeAn('object').toExist()
    expect(result).toInclude({ path: path, hash: hash })
  })

  it('must find the correct route, even without the first `#`', function () {
    var path = routes[0].path
    var hash = path.substr(1)
    var result = router.match(hash)

    expect(result).toBeAn('object').toExist()
    expect(result).toInclude({ path: path, hash: hash })
  })

  it('must find the correct route, even without the first `/`', function () {
    var path = routes[0].path
    var hash = path.replace('#/', '#')
    var result = router.match(hash)

    expect(result).toBeAn('object').toExist()
    expect(result).toInclude({ path: path, hash: hash })
  })

  it('must give precendence to parameterless routes', function () {
    var hash = routes[3].path
    var result = router.match(hash)

    expect(result).toBeAn('object').toExist()
    expect(result).toInclude({ path: hash, hash: hash })
    expect(result.params).toEqual({})
  })

  it('...and fallback to other with params', function () {
    var path = routes[1].path
    var hash = path.replace(':id', 5)
    var result = router.match(hash)

    expect(result).toBeAn('object').toExist()
    expect(result).toInclude({ path: path, hash: hash })
    expect(result.params).toEqual({ id: '5' })
  })

  it('must return `null` if no rule matches the hash', function () {
    var hash = '@'
    var result = router.match(hash)

    expect(result).toBe(null)
  })

  it('must ignore last `?` without parameters', function () {
    var hash = '#/recursos?'
    var result = router.match(hash)

    expect(result).toBeAn('object').toExist()
    expect(result.params).toEqual({})
  })

  it('must not partially match rules', function () {
    var hash = '#/recurso'
    var result = router.match(hash)
    expect(result).toBe(null)
  })

  it('must not partially match rules, even with queryString', function () {
    var hash = '#/recurso?a=1'
    var result = router.match(hash)
    expect(result).toBe(null)
  })

  it('must preserve the case of param values in the hash', function () {
    var path = routes[1].path
    var hash = path.replace(':id', 'ABc')
    var result = router.match(hash)

    expect(result).toBeAn('object').toExist()
    expect(result).toInclude({ path: path, hash: hash })
    expect(result.params).toEqual({ id: 'ABc' })
  })

  it('must preserve and match the case of param names', function () {
    var route = {
      path: '#/recurso/:Id',
      title: 'Uppercased'
    }
    var path = route.path
    var hash = path.replace(':Id', 5)
    var result = router.add(route).match(hash)

    expect(result).toBeAn('object').toExist()
    expect(result).toInclude({ hash: hash, path: path, title: route.title })
    expect(result.params).toInclude({ Id: 5 })
  })

  it('must find params in the middle of the hash', function () {
    var hash = routes[2].path
    var result = router.match(hash.replace(':id', 5))

    expect(result).toBeAn('object').toExist()
    expect(result.path).toBe(hash)
    expect(result.params.id).toEqual(5)
  })

  it('must find querystring params at the end of the hash', function () {
    var hash = routes[0].path
    var result = router.match(hash + '/?orden=9') // slash intentional

    expect(result).toBeAn('object').toExist()
    expect(result.path).toBe(hash)
    expect(JSON.stringify(result.params)).toEqual('{"orden":"9"}')
  })

  it('must find querystring params after other params', function () {
    var hash = routes[2].path
    var result = router.match(hash.replace(':id', 5) + '?orden=9')

    expect(result).toBeAn('object').toExist()
    expect(result.path).toBe(hash)
    expect(result.params.id).toEqual(5)
    expect(result.params.orden).toEqual(9)
  })

  it('must give precedence to querystring params over the hash', function () {
    var path = routes[1].path
    var hash = path.replace(':id', '5?id=6')
    var result = router.match(hash)

    expect(result).toBeAn('object').toExist()
    expect(result).toInclude({ path: path, hash: hash })
    expect(result.params).toEqual({ id: '6' })
  })

  it('must preserve the case of param name/values in the querystring', function () {
    var path = routes[0].path
    var hash = path + '?Id=ABc'
    var result = router.match(hash)

    expect(result).toBeAn('object').toExist()
    expect(result).toInclude({ path: path, hash: hash })
    expect(result.params).toEqual({ Id: 'ABc' })
  })

  it('must decode name/values in the querystring', function () {
    var path = routes[0].path
    var hash = path + '?' + encodeURIComponent('&=') + '=' + encodeURIComponent('foo?')
    var result = router.match(hash)

    expect(result).toBeAn('object').toExist()
    expect(result).toInclude({ path: path, hash: hash })
    expect(result.params).toEqual({ '&=': 'foo?' })
  })

  it('must decode name/values in the hash and querystring', function () {
    var path = routes[1].path
    var hash = path.replace(':id', encodeURIComponent('=?')) +
      '?' + encodeURIComponent('&=') + '=' + encodeURIComponent('foo?')
    var result = router.match(hash)

    expect(result).toBeAn('object').toExist()
    expect(result).toInclude({ path: path, hash: hash })
    expect(result.params).toEqual({ 'id': '=?', '&=': 'foo?' })
  })

})
