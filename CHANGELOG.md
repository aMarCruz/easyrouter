# Changes for easyRouter

### 2017-09-09 v0.3.0
- Fix error for inexistent routes.
- Parameter for `listen` if used as the fallback hash.

### 2017-03-22 v0.2.0
- Better support for parameters in queryString.

#### Important Breaking Change

The method `get` is renamed to `route`, this is to avoid issues with the ES6 native `get`.

### 2016-10-24 v0.1.3

- Fix a bug with non existent route generating error.
- Updated `devDependencies`.

### 2016-10-18 v0.1.2

- Fix the `haschange` handler loosing the context.

### 2016-10-17 v0.1.1

- Include `add` method as an alias for `concat`.
- Renamed internal `dispatch` method to `_run`.
- Some code reduction.
- Adds documentation.

### 2016-10-17 v0.1.0

Initial release.
