/**
 * Simple function to empty an element
 * @param el
 */
const empty = function (el) {
    while( el.firstChild) el.removeChild(el.firstChild);
};

export default empty