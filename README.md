# EasyRouter

[![npm Version][npm-badge]][npm-url]
[![License][license-badge]][license-url]
[![Build Status][travis-badge]][travis-url]
[![Coverage][codecov-badge]][codecov-url]
[![Bundle Size][size-badge]][size-url]

The tiny, fast, easy, yet powerful hash router in JavaScript.

- About 3K minified, 1.4K gzipped
- No performance drop as you add routes
- Order of route declaration doesn't matter: the most specific route wins
- Parses query strings (see note)
- TypeScript v3 definitions
- Zero dependencies

## NOTE

For easyRoute to recognize query strings, the query must follow the hash (be part of it).
This is not standard and the assignment through the `href` **property** will not work, you must assign the location directly or use `setAttribute`.

Example:

```js
location.hash = `/customers/1?order=${orderNo}`

// or...
const anchor = document.getElementById('anchor-id')
anchor.setAttribute('href', `#/customers/1?order=${orderNo}`)
```

## Changes in v2.0.0

The most important change is the renaming of the methods `enter` and `exit` of the router (now `onEnter` and `onExit`), and the removal of the alias `concat`.

From v2.0 the hash is not case sensitive, except in the parameters' names and values.

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

## Usage

```js
// Require the router if using brunch, browserify, webpack, etc.
const router = require('easyrouter')

// handler for '#/login', defined by the `enter` method of the route.
const login = () => {
  // Here you can, by example, show a popup or change all the content
  // of the page.
  console.log('Login')
}

// This function handles routes for two rules, one of them has a placeholder
// ':id' whose value will be extracted from the hash that enters the route
// and placed in the property 'id' of 'params'.
// 'title' is a custom property of the route context defined by us.
//
// NOTE the use of the 'function' keyword, since we are accessing `this`,
//      we should not use an arrow function here.
//
const resourceEditor = function (params) {
  $('#header').html(this.title)

  // IMPORTANT: Parameter values are of type 'string', always.
  if (params.id) {
    console.log(`Editing the resource ${params.id}`)
  } else {
    console.log(`Creating a new resource.`)
  }
}

// Data for the routes.
// The 'path' property defines the rule and is the only required property.
// 'title' is a custom property and will be part of the route context.
// 'enter' methods here takes precedence over the callback passed to the
// router `add` function.
const data = [
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
    path: '#/resource/ext/*',  // the '*' allows hashes that start with
    title: 'Other resource'    // '#/resources/ext', the complete hash can
  }, {                         // be obtained from the context.
    path: '#/login',
    enter: login
  }
]

// Configure and start the router.
// This is a singleton that maintains its state between hash changes.
// You can reset it completely with the `reset` method.
router
  // The `add` method adds routes without eliminating the previous ones.
  // Its additional parameter is the default `enter` method for the routes
  // that are added.
  .add(data, function (params) {
    // The `enter` method is executed in the context of the current route
    // and receives a parameter with values in the current hash.
    console.log(this.hash, params)
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
  // starts the router using "#/login" for users that arrives to this
  // page without a hash.
  .listen('#login')
```

## API

### `add(data [, callback])` ⇒ router

Registers one or more routes.

The received data is used as a template to generate the routes.

Parameter | Description
--------- | -----------
data      | Can be an object or array of objects, its property `path` specifies the rule.
callback  | Optional `enter` method for routes without one.

_Note:_ The alias `concat` was removed in v2.0

### `clear()` ⇒ router

Empties the routes.

The global callbacks (onEnter, onExit, rescue) are preserved.

### `getContext()` ⇒ context

Returns the context of the router.
It includes the last saved route or `null` if there's no such route (like after a `reset`).

The object returned by `getContext` has this properties:

Property  | Type     | Description
--------- | -------- | -----------
isActive  | boolean  | Is the router handling hash changes?
lastHash  | string   | Last handled hash.
lastRoute | Object   | Last handled route, including hash and parameters.
prevRoute | Object   | Previous handled route, including hash and parameters.
onEnter   | Function | Global callback registered by the `onEnter` method.
onExit    | Function | Global callback registered by the `onExit` method.
rescue    | Function | Fallback function registered by the `rescue` method.

### `listen(root)` ⇒ router

Start handling hash changes.

`root` is the hash for URLs without a defined path to which a user will be redirected.

This route will be automatically selected by this method unless the page already has a hash.

### `match(hash)` ⇒ route context

Returns an object with the route for a matching hash.

The route includes the parameters given in the hash.

### `navigate(hash [, force])` ⇒ router

Goes to the given `hash`.

If `force` is `true`, the route and global callbacks run even if the hash is the current.

### `onEnter(callback)` ⇒ router

Set the global callback executed whenever the hash changes, after the `route.query`, `route.exit` and `router.onExit` methods.

The first parameter received by the callback is an object with the new route data, and the router as the default context (`this`).

The second parameter is the previous route, if any.

_NOTE:_

This callback will be called even if there's no match for the next hash or the new location has no hash. In this cases the parameter passed to the callback will be `null`. In the last case it will be called once, when the hash is removed.

### `onExit(callback)` ⇒ router

Set the global callback executed whenever the hash changes, before the `route.enter`, `router.onEnter` and `router.rescue` methods.

The first parameter received by the callback is an object with the previous route data, and the router as the default context (`this`).

The second one is the new route data.

_NOTE:_

This callback will be called even if there's no match for the previous hash or the previous location has no hash. In this cases the parameter passed to the callback will be `null`.

### `rescue(callback)` ⇒ router

Set the global callback called with the current hash when no rule matches the hash or the route has no an `enter` method.

If you do not provide a `rescue` method, the router will set one to redirect your users to the "root" defined by the `listen` method.

This lets you provide instant user feedback if they click an undefined route.

### `reset()` ⇒ router

Clears the registered routes and global callbacks, without stopping the router.

Generally, this method will be followed by `stop` or by a re-initialization.

### `route(rule)` ⇒ route object

Returns the route object assigned to the given `rule`.

The parameter is the rule used to register a route, it is not the hash of the current location.

The returned route does not includes the hash nor parameters values.

### `stop()` ⇒ router

Stops the router.

Any routes and global callbacks are preserved.

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
        router.onExit(oldRoute, newRoute)
  (called with undefined if there's no old route)
                       |
                       v
  (here, the router grab the change, so entering
    again this hash will no repeat the process)
                       |
                       v
        router.onEnter(newRoute, oldRoute)
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

All this work is done after the hash is set in the browser address-bar, so returning `false` from the `exit` method does not reset this, but in the case of `query` the router will emit `navigate(prevRoute.hash)` to restore the previous route.

Also, the `query` and `exit` methods are called with the old route as context (`this`), and the `enter` method with the new one.

These routes have two additional properties: `hash`, a string with the normalized value of the matched hash, and `params`, an object that contains the parameter values parsed from the hash as strings.

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

## TODO

- [ ] Rules with optional parameters
- [ ] CI test for more browsers
- [ ] Enhanced documentation

## Support my Work

I'm a full-stack developer with more than 20 year of experience and I try to share most of my work for free and help others, but this takes a significant amount of time and effort so, if you like my work, please consider...

<!-- markdownlint-disable MD033 -->
[<img src="https://amarcruz.github.io/images/kofi_blue.png" height="36" title="Support Me on Ko-fi" />][kofi-url]
<!-- markdownlint-enable MD033 -->

Of course, feedback, PRs, and stars are also welcome 🙃

Thanks for your support!

## License

The [MIT License](LICENCE) (MIT)

[npm-badge]:      https://badgen.net/npm/v/easyrouter
[npm-url]:        https://www.npmjs.com/package/easyrouter
[license-badge]:  https://badgen.net/npm/license/easyrouter
[license-url]:    https://github.com/aMarCruz/easyrouter/blob/master/LICENSE
[size-badge]:     https://badgen.net/bundlephobia/min/easyrouter
[size-url]:       https://bundlephobia.com/result?p=easyrouter
[travis-badge]:   https://travis-ci.org/aMarCruz/easyrouter.svg?branch=master
[travis-url]:     https://travis-ci.org/aMarCruz/easyrouter
[codecov-badge]:  https://codecov.io/gh/aMarCruz/easyrouter/branch/master/graph/badge.svg
[codecov-url]:    https://codecov.io/gh/aMarCruz/easyrouter
[kofi-url]:       https://ko-fi.com/C0C7LF7I
