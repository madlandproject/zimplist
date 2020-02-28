

export function isElement(value) {
  return value instanceof Element && value.nodeType === 1
}

export function isString(value) {
  return typeof value === 'string';
}

export function isFunction(value) {
  return typeof value === 'function';
}

export function isArray(value) {
  return value instanceof Array;
}
