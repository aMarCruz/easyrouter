# EasyRouter

[![npm Version][npm-badge]][npm-url]
[![License][license-badge]][license-url]
[![Build Status][travis-badge]][travis-url]
[![Coverage][codecov-badge]][codecov-url]
[![Size][size-badge]][size-url]

Tiny, fast, easy, yet powerful hash router in JavaScript.

- About 3K minified, 1K gzipped
- No performance drop as you add routes
- Order of route declaration doesn't matter: the most specific route wins
- Parses query strings (See NOTE)
- TypeScript v3 definitions
- Zero dependencies

## NOTE

For easyRoute to recognize query strings, this must follow the hash (be part of it).
This is not standard the assignment through the `href` **property** does not work, you must use literal anchors or `setAttribute`.

Example:

```js
location.hash = `#/customers/1?order=${orderNo}`

// or...
const anchor = document.createElement('a')
anchor.setAttribute(`#/customers/1?order=${orderNo}`)
```

It is not likely that this restriction can change.

## Changes in v1.0.0

The most important change is the renaming of the methods `enter` and `exit` of the router, which are now `onEnter` and `onExit`, and the removal of the alias `concat`.

Please see the [Changelog](CHANGELOG.md) for more information.

## Install

npm

```bash
npm install easyrouter --save
# or
yarn add easyrouter
```

Bower

```bash
bower install easyrouter --save
```

In the browser

```html
<script src="https://unpkg.com/easyrouter/easyrouter.min.js"></script>
```

The folder `dist` has tree builds:

Filename          | Description
----------------- | -----------
easyrouter.js     | CommonJS build for node, browserify, brunch, webpack, etc.
easyrouter.es.js  | ESM build for rollup or other module capable blunders.
easyrouter.umd.js | Generic UMD build

In the root is `easyrouter.min.js`, a minified UMD version for browsers that stores the router instance in the global variable `window.router`.

## Example

```js
// Require the router if using brunch, browserify, webpack, etc.
const router = require('easyrouter')

function login () {
  // display login
}

// params can be null if the new hash was not registered in the route map.
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
  }, {
    path: '#/login',
    enter: login
  }

]

// Use the `add` method to add all the routes.
// Its additional parameter is the default `enter` method for each route.
router
  .add(routes, (params) => {
    // default enter method executed in the context of the current route.
    // the params are the parameter values given by the current hash.
    console.log(this.hash)
  })
  .onExit((route) => {
    // global callback called on exit a previous route
    console.log(`Leaving ${route.hash}`)
  })
  .onEnter((route) => {
    // global callback called before run the current route
    console.log(`Entering ${route.hash}`)
  })
  .rescue((hash) => {
    // executed for non-existing routes or routes without `enter` method
    location.href = 'errors/404.html'
  })
  // start the router using "#/login" for users that arrives to this
  // page without a hash
  .listen('#login')
```

## API

### `add(routes [, callback])`

Registers one or more routes.

The received objects are used as a template to generate the routes.

Parameter | Description
--------- | -----------
routes    | Can be an object or array of objects, their property `path` specifies the rule.
callback  | Optional `enter` method for routes without one.

_Note:_ The alias `concat` was removed in v1.0

### `clear()`

Empties the routes.

The global callbacks (onEnter, onExit, rescue) are preserved.

### getContext

Returns the context of the router.
It includes the last saved route or `null` if there's no such route (like after a `reset`).

The content returned object:

Property  | Type     | Description
--------- | -------- | -----------
isActive  | boolean  | Is the router handling hash changes?
lastHash  | string   | Last handled hash.
lastRoute | Object   | Last handled route, including hash and parameters.
onEnter   | Function | Global callback registered by the `onEnter` method.
onExit    | Function | Global callback registered by the `onExit` method.
rescue    | Function | Fallback function registered by the `rescue` method.

### `listen(root)`

Start handling hash changes.

`root` is the hash for URLs without a defined path to which a user will be redirected.

This route will be automatically selected in the page load, unless the page already has a hash.

### `match(hash)`

Returns an object with the route for a matching hash.

The route includes the parameters given in the hash.

### `navigate(hash [, force])`

Goes to the given `hash`.

If `force` is `true`, the callback runs even if the hash is current.

### `onEnter(callback)`

Set the global callback called _always_ that the hash changes, after the `route.query`, `route.exit` and `router.onExit` methods.

The parameter received by the callback is an object with the next route data, and the default context (`this`) is the router itself.

_NOTE:_

This callback will be called even if there's no match for the next hash or the new location has no hash. In this cases the parameter passed to the callback will be `null`. In the last case it will be called once, when the hash is removed.

### `onExit(callback)`

Set the global callback called when the hash changes, before the `route.enter`, `router.onEnter` and `router.rescue` methods.

The parameter received by the callback is an object with the previous route data, and the default context (`this`) is the router itself.

_NOTE:_

This callback will be called even if there's no match for the previous hash or the previous location has no hash. In this cases the parameter passed to the callback will be `null`.

### `rescue(callback)`

Set the global callback called with the current hash when no rule matches the hash or the route has no an `enter` method.

If you do not provide a `rescue` method, the router will set one to redirect your users to the "root" defined by the `listen` method.

This lets you provide instant user feedback if they click an undefined route.

### `reset()`

Clears the routes and global callbacks, without stopping the router.

Generally, this method will be followed by `stop` or by a re-initialization.

### `route(rule)`

Returns the route object assigned to the given `rule`.

The parameter is the rule used to register a route, it is not the hash of the current location.

The returned object does not includes the hash nor parameters values.

### `stop()`

Stops the router.

Any routes or global callbacks are preserved.

You will need to call `listen` to re-enable the router.

---

## Route Instances

A route is un plain object with the following propertites:

Property | Type     | Description
-------- | -------- | -----------
path     | string   | Rule with the path and parameter markers
query    | function | Called only when the query-string changes _for a **same hash_**
exit     | function | Called before call the `enter` and `onEnter` methods
enter    | function | Called when the hash changes, with the parameters of the current hash
hash     | string   | Matched hash (normalized)
params   | object   | Object with the parameter names and values extracted from the hash.<br>**Note:** All the parameter values are strings.

When passing route templates to the router `add` method, you can omit anything except `path`.

Any custom properties are copied to the route, so it can be accessed through `this` within the `query`, `enter` and `exit` methods of the route.

## Event Pipeline

This is the order of event when on hash changes:

```
              efective hash change
                       |
                       v
      (if only the query-string was changed)
            oldRoute.query(newParams)
(abort and back to previous hash if it returns `false`)
                       |
                       v
           (if there's an old route)
            oldRoute.exit(oldParams)
  (abort without go back, if it returns `false`)
                       |
                       v
             router.onExit(oldRoute)
  (called with undefined if there's no old route)
                       |
                       v
  (here, the router grab the change, so entering
    again this hash will no repeat the process)
                       |
                       v
            router.onEnter(newRoute)
                       |
                       v
 there's a match with an `enter` method for the hash?
                       |
          +------------+-------------+
          |                          |
          v                          v
         Yes                         No
newRoute.enter(params)       router.rescue(hash)
```

All this work is done after the hash is set in the browser addressbar, so returning `false` from the `exit` method does not reset this, but in the case of `query` the router will emit `navigate(prevRoute.hash)` to restore the previous route.

Also, the `query` and `exit` methods are called with the old route as context (`this`), and the `enter` method with the new one.

These routes have two additional properties: `hash`, a string with the normalized value of the matched hash, and `params`, an object that contains the parameters extracted from the hash, with string values.

This is an example showing an async modal dialog if a leaving form has changes:

```js
function oldRouteExit () {
  if ($('form').hasClass('dirty')) {
    App.ui.confirm('Are you sure to cancel your edition?')
      .then((button) => {
        if (button === App.ui.YES) {
          router.navigate(location.hash)
        }
      })
    router.navigate(this.hash) // not required if used in `query`.
    return false
  }
}
```

## Support my Work

I'm a full-stack developer with more than 20 year of experience and I try to share most of my work for free and help others, but this takes a significant amount of time and effort so, if you like my work, please consider...

<!-- markdownlint-disable MD033 -->
[<img src="https://amarcruz.github.io/images/kofi_blue.png" height="36" title="Support Me on Ko-fi" />][kofi-url]
<!-- markdownlint-enable MD033 -->

Of course, feedback, PRs, and stars are also welcome 🙃

Thanks for your support!

## License

The [MIT License](LICENCE) (MIT)

[npm-badge]:      https://img.shields.io/npm/v/easyrouter.svg
[npm-url]:        https://www.npmjs.com/package/easyrouter
[license-badge]:  https://img.shields.io/npm/l/express.svg
[license-url]:    https://github.com/aMarCruz/easyrouter/blob/master/LICENSE
[size-badge]:     https://badges.herokuapp.com/size/npm/easyrouter/easyrouter.min.js
[size-url]:       https://www.npmjs.com/package/easyrouter
[travis-badge]:   https://travis-ci.org/aMarCruz/easyrouter.svg?branch=master
[travis-url]:     https://travis-ci.org/aMarCruz/easyrouter
[codecov-badge]:  https://codecov.io/gh/aMarCruz/easyrouter/branch/master/graph/badge.svg
[codecov-url]:    https://codecov.io/gh/aMarCruz/easyrouter
[kofi-url]:       https://ko-fi.com/C0C7LF7I
