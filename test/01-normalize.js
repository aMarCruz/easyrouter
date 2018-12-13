/* global expect, router */

describe('normalize', function () {

  /** @type {(s: string) => string} */
  var normalize = router._normalize

  it('must convert empty hash to `#`', function () {
    expect(normalize('')).toBe('#')
  })

  it('must leave a single `#` as-is', function () {
    expect(normalize('#')).toBe('#')
  })

  it('must convert a single slash to `#/`', function () {
    expect(normalize('/')).toBe('#/')
  })

  it('must leave a `#/` as-is', function () {
    expect(normalize('#/')).toBe('#/')
  })

  it('must add missing `#` in front the hash', function () {
    expect(normalize('f')).toBe('#/f')
    expect(normalize('f/')).toBe('#/f')
    expect(normalize('foo')).toBe('#/foo')
    expect(normalize('/f')).toBe('#/f')
    expect(normalize('/f/')).toBe('#/f')
    expect(normalize('/foo')).toBe('#/foo')
    expect(normalize('/foo/')).toBe('#/foo')
    expect(normalize('/foo/bar')).toBe('#/foo/bar')
  })

  it('must insert missing `/` after the `#`', function () {
    expect(normalize('#f')).toBe('#/f')
    expect(normalize('#f/')).toBe('#/f')
    expect(normalize('#foo')).toBe('#/foo')
    expect(normalize('#foo/')).toBe('#/foo')
    expect(normalize('#foo/bar')).toBe('#/foo/bar')
  })

  it('must remove the last slash, except for `#/`', function () {
    expect(normalize('#/f/')).toBe('#/f')
    expect(normalize('#/foo/')).toBe('#/foo')
    expect(normalize('#/foo/bar/')).toBe('#/foo/bar')
    expect(normalize('#f/')).toBe('#/f')
    expect(normalize('#foo/')).toBe('#/foo')
    expect(normalize('#foo/bar/')).toBe('#/foo/bar')
  })

  it('must do nothing for correct hashes', function () {
    expect(normalize('#/')).toBe('#/')
    expect(normalize('#/f')).toBe('#/f')
    expect(normalize('#/foo')).toBe('#/foo')
    expect(normalize('#/foo/bar')).toBe('#/foo/bar')
  })

})
