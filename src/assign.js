
export default function assign (dest, src) {
  if (src) {
    Object.keys(Object(src)).forEach((p) => { dest[p] = src[p] })
  }
  return dest
}
