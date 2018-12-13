/* eslint prefer-template:0 */
/* eslint-env node */

import sourcemaps from 'rollup-plugin-sourcemaps'
import cleanup from 'rollup-plugin-cleanup'
import jscc from 'rollup-plugin-jscc'
const external = ['fs', 'path']

const banner = `/**
* easyRouter v${require('./package.json').version}
* @author aMarCruz
* @licence MIT
*/
/* eslint-disable */`

const isDev = process.env.BUILD === 'test'

export default {
  input: 'dist/easyrouter.es.js',
  plugins: [
    isDev ? sourcemaps() : undefined,
    jscc({
      asloader: false,
      prefixes: [/\/[/*]/]
    }),
    cleanup({
      comments: ['jsdoc', 'istanbul']
    })
  ],
  output: [
    { banner, file: 'dist/easyrouter.js', format: 'cjs' },
    { banner, file: 'dist/easyrouter.umd.js', format: 'umd', name: 'router' }
  ],
  external
}
