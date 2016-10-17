[![npm Version][npm-image]][npm-url]
[![License][license-image]][license-url]

# EasyRouter

Tiny, fast, easy, yet powerful hash router in JavaScript.

* About 2K minified, bellow 1K gzipped
* No performance drop as you add routes
* Order of route declaration doesn't matter: the most specific route wins
* Parses query strings
* Zero dependencies


## Install

npm or bower

```bash
npm install easyrouter --save
bower install easyrouter --save
```

## Example

```js
// Require the router if using brunch, browserify, webpack, etc.
const router = require('easyrouter')

function resourceEditor (params) {
  if (params.id) {
    // edit existing resource
  } else {
    // edit a new resource
  }
}

// Define one or more routes.
// `enter` method takes precedence over the callback of `concat`
const routes = [
  {
    path: '#/resources',
    title: 'Resources'
  }, {
    path: '#/resource/:id',
    title: 'Edit resource',
    enter: resourceEditor
  }, {
    path: '#/resource/new',
    title: 'New resource',
    enter: resourceEditor
  }, {
    path: '#/resource/ext/*',
    title: 'Other resource'
  }
]

// Use the `concat` method for all
router
  .add(routes, (route) => {
    console.log(this.hash)
  })
  .enter((route) => {
    // global callback called before run the route
  })
  .exit((route) => {
    // global callback called after exit the route
  })
  .rescue((hash) => {
    // executed for non-existing routes, takes the normalized hash
  })
  // use #/ for users that arrives to this page without a hash
  .listen('#/')
```

## API

### `add(routes [, callback])`

Defines one or more routes.

`routes` can be an object or array of objects, their property `path` specifies the rule.

`callback` is an optional default `enter` method for each route (particular `enter` ovewrite it).

```js
router.add(routesArray)
```

alias: `concat`

### `clear()`

Empties the routes.

```js
router.clear()
// now the 'rescue' method, if any, will run on each hash change
```

### `enter(callback)`

Set the global callback called when the hash changes.

```js
router.enter(() => {
  $('#main-page>.content').stop(true, true).fadeIn()
})
```

### `exit(callback)`

Set the global callback called when leaving the current hash.

```js
router.exit(() => {
  $('#main-page>.content').fadeOut(() => { $(this).empty() })
})
```

### `rescue(callback)`

Set the global callback called when no rule matches the hash.

```js
router.rescue((hash) => {
  const view = require('./views/page404.hbs')
  $('#main-page>.content').html(view({ hash }))
})
```

### `get(rule)`

Returns the route object assigned to the rule.

```js
const route = router.get('#/resource/:id')
```

### `match(hash)`

Returns an object with `{ ruote, params }` for a matching route.

```js
const match = router.match(previousHash)
match.route.enter(match.params)
```

### `navigate(hash [, force])`

Go to the given hash.

If `force` is `true`, the callback runs even if the hash is current.

```js
App.errorRecovery = () => {
  router.navigate('#/')
  //...
}
```

### `listen(root)`

Start handling routes.

`root` is the default hash for URLs with no hash.

```js
router.listen('#/login')
```

### `reset()`

Stop the router and clear its internal state.

```js
App.onChangeModule((module) => {
  router.reset()
  // now the router singleton is like a new guy
  //...
})
```

---

## Route Instances

A route is un plain object with the following propertites:

```js
{
  path: '#/',                 // String with the rule
  enter: (params) => {},      // Called when the hash changes
  exit: () => {}              // Called before call the new route callback
  hash: '#/',                 // Matched hash (normalized)
  params: {}                  // Extracted parameters
  //, other properties
}
```

When passing route templates to the `add` method of the router, you can omit anything except `path`.

Additional properties are copied to the route, so can be accessed through `this` inside the `enter` and `exit` methods.

Each time that the route is matched, its `hash` and `params` properties are updated.


## Life Cycle

This is the order of event when on hash changes:

```
             efective hash change
                      |
                      v
          (if there's an old route)
               oldRoute.exit()
          (abort if returns `false`)
                      |
                      v
            router.exit(oldRoute)
  (called with undefined if there's no old route)
                      |
                      v
  (here, the router grab the change, so entering
    again this hash will no repeat the process)
                      |
                      v
            router.enter(newRoute)
                      |
                      v
        there's a match for the new hash?
                      |
         +------------+-------------+
         |                          |
         v                          v
        Yes                         No
newRoute.enter(params)      router.rescue(hash)
```

Note that all this work is done after the hash is set in the browser addressbar,
so returning `false` from `oldRoute.exit` does not reset this.

Also, particular `enter` and `exit` methods are called with the route as context (`this` points to the route),
and the route has two additional properties: `hash`, a string with the value of the matched location.hash (normalized)
and `params`, an object that holds the extracted parameters (with all values as strings).

This is an example showing an async modal dialog if form has changes:

```js
function oldRouteExit () {
  if ($('form').hasClass('dirty')) {
    App.ui.confirm('Are you sure to cancel your edition?')
      .then((button) => {
        if (button === App.ui.YES) {
          router.navigate(location.hash)
        }
      })
    location.hash = this.hash
    return false
  }
}
```


## License

The [MIT License](LICENCE) (MIT)

[npm-image]:      https://img.shields.io/npm/v/easyrouter.svg
[npm-url]:        https://www.npmjs.com/package/easyrouter
[license-image]:  https://img.shields.io/npm/l/express.svg
[license-url]:    https://github.com/aMarCruz/easyrouter/blob/master/LICENSE