/**
 * Determine if a string starts with another string
 *
 * @param {string} target String to test
 * @param {string} criteria sub-string to search for
 */
export default function startsWith(target, criteria) {
  return target.substring(0, criteria.length) === criteria
}
