/* global expect, router */

describe('add and route', function () {

  it('can add one only rule instead an array', function () {
    var route = {
      path: '#/recursos',
      title: 'Recursos'
    }
    router.reset().add(route)

    route = router.route('#/recursos')
    expect(route).toInclude({ path: '#/recursos', title: 'Recursos' })
  })

  it('must overwride rule if unique diff is the case', function () {
    var routes = [
      {
        path: '#/recursos',
        title: 'Recursos'
      }, {
        path: '#/Recursos',
        title: 'Recursos 2'
      }, {
        path: '#/recurso/:id',
        title: 'Recurso'
      }, {
        path: '#/RECURSO/:id',
        title: 'Recurso 3'
      }
    ]
    router.reset().add(routes)

    var route = router.route('#/recursos')
    expect(route).toInclude({ path: '#/Recursos', title: 'Recursos 2' })
    route = router.route('#/recurso/:id')
    expect(route).toInclude({ path: '#/RECURSO/:id', title: 'Recurso 3' })
  })

  it('must find exact plain routes', function () {
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
    router.reset().add(routes)

    for (var i = 0; i < routes.length; i++) {
      var path = routes[i].path
      var result = router.route(path)

      expect(result).toBeAn('object').toExist()
      expect(result).toInclude({ path: path, title: routes[i].title })
    }
  })

  it('must not differentiate `#` from `#/` (last added wins)', function () {
    var routes = [
      {
        path: '#/',
        title: 'Home'
      }, {
        path: '#',
        title: 'Home 2'
      }
    ]

    router.reset().add(routes)

    for (var i = 0; i < routes.length; i++) {
      var path = routes[i].path
      var result = router.route(path)

      expect(result).toBeAn('object').toExist()
      expect(result).toInclude({ path: '#', title: 'Home 2' })
    }
  })

  it('must return `null` if the rule was not found', function () {

    router.reset().add({ path: '#/abc' })
    var route = router.route('#/abc/xyz')

    expect(route).toBe(null)
  })

})
