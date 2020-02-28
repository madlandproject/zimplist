export default function defaults(target, ...sources) {
  for (let source of sources) {
    for (let key in source) {
      target[key] = (target[key] !== undefined) ? target[key] : source[key];
    }
  }
}
