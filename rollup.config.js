/* eslint prefer-template:0 */
/* eslint-env node */

import buble from 'rollup-plugin-buble'
import jscc  from 'rollup-plugin-jscc'
const external = ['fs', 'path']

const banner = [
  '/**',
  ' * easyRouter v' + require('./package.json').version,
  ' * @author aMarCruz',
  ' * @licence MIT',
  ' */',
  '/* eslint-disable */',
  ''
].join('\n')

export default {
  input: 'src/main.js',
  name: 'router',
  plugins: [
    jscc(),
    buble()
  ],
  output: [
    { banner: banner, file: 'dist/easyrouter.js', format: 'cjs' },
    { banner: banner, file: 'dist/easyrouter.es.js', format: 'es' },
    { banner: banner, file: 'dist/easyrouter.umd.js', format: 'umd' }
  ],
  external: external
}
