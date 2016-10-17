/**
 * Hash normalization, adds the first '#' and removes the last slash.
 *
 * @param   {String} hash - The hash to normalize
 * @returns {String} Normalized hash.
 */
export default function normalize (hash) {

  // if the hash is empty, this will output the '#' alone
  if (hash[0] !== '#') {
    hash = `#${hash}`
  }

  // only removing if length > 2 allows '#/'
  return hash.length > 2 && hash.slice(-1) === '/'
       ? hash.slice(0, -1) : hash
}
