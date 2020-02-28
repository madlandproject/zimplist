/**
 * Determine if a string ends with the specified criteria string
 *
 * @param {string} target String to test
 * @param {string} criteria sub-string to search for
 */
export default function endsWith(target, criteria) {
  return target.slice(criteria.length * -1) === criteria
}
