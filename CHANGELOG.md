# Changes for easyRouter

## \[Unreleased]

### Changes

- Update devDependencies and ESLint rules.
- Lock version of expect in devDependencies.
- New Changelog format.

## \[1.0.0] - 2017-10-12

Breaking changes

- Updated README.md
- New `query` method for routes, runs only for querystring changes (See README).
- The route passed to methods is a shallow copy of the original route.
- Update rollup to v0.50.x

## \[0.3.0] - 2017-09-09

- Fix error for inexistent routes.
- Parameter for `listen` if used as the fallback hash.

## \[0.2.0] - 2017-03-22

Breaking Changes

- Better support for parameters in queryString.
- The method `get` is renamed to `route`, this is to avoid issues with the ES6 native `get`.

## \[0.1.3] - 2016-10-24

- Fix a bug with non existent route generating error.
- Updated `devDependencies`.

## \[0.1.2] - 2016-10-18

- Fix the `haschange` handler loosing the context.

## \[0.1.1] - 2016-10-17

- Include `add` method as an alias for `concat`.
- Renamed internal `dispatch` method to `_run`.
- Some code reduction.
- Adds documentation.

## \[0.1.0] - 2016-10-17

Initial release.
