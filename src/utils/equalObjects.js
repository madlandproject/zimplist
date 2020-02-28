/**
 * Simple function to check if object properties are the same.
 *
 * @param x
 * @param y
 * @return {boolean}
 */
export function equalObjects(x, y) {
  let isEqual = false;

  if (x && y && typeof x === 'object' && typeof y === 'object') {
    if (Object.keys(x).length === Object.keys(y).length) {
      isEqual = Object.keys(x).reduce(function(isEqual, key) {
        return isEqual && equalObjects(x[key], y[key]);
      }, true);
    }
  } else if (x === y) {
    isEqual = true;
  }
  return isEqual;
}
