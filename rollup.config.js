
import buble from 'rollup-plugin-buble'
import jscc  from 'rollup-plugin-jscc'
const external = ['fs', 'path']

export default {
  entry: 'src/main.js',
  plugins: [
    jscc(),
    buble()
  ],
  external: external
}
