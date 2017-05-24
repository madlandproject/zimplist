/**
 * Simple function to empty an element
 * @param {Element} el - DOMElement to empty by removing all it's children.
 */
const empty = function (el) {
    while ( el.firstChild ) el.removeChild(el.firstChild);
};

export default empty