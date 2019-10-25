export default function findLast(array, predicate) {
  let i = array.length;
  while (i >= 0) {
    const element = array[i];
    if (predicate(element, i, array)) {
      return element
    }
    i--;
  }
}
