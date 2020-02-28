export default function findLast(array, predicate) {
  let i = array.length;
  let item;
  while (i >= 0) {
    item = array[i];
    if (predicate(item, i, array)) {
      break;
    }
    i--;
  }
  return item;
}
