# EasyRouter

Tiny, fast, easy, yet powerful hash router in JavaScript.

## Install

npm or bower

```bash
npm i easyrouter --save
bower install easyrouter --save
```

## Example

```js
const routes = [
  {
    path: '#/resources',
    title: 'Resources'
  }, {
    path: '#/resource/:id',
    title: 'Edit resource',
  }, {
    path: '#/resource/new',
    title: 'New resource'
  }, {
    path: '#/resource/ext/*',
    title: 'Other resource'
  }
]

router.concat(routes, (route) => {
  console.log(route.params)
})
.enter((route) => {
  // global function before run the route
})
.exit((route) => {
  // global function before exit the route
})
.rescue((hash) => {
  // when not found
})
.listen()
```
