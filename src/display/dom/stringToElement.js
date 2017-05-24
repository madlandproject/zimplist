/**
 * Turns a string representing one or more DOM elements into usable objects.
 * @param {string} sourceString
 * @returns {Element|DocumentFragment} The DOM representation of the string. If multiple root tags are present in the
 *     string, it will return a DocumentFragment
 */
const stringToElement = function (sourceString) {
    // create a dummy element that is used
    let elementIterator = document.createElement("div");
    let i;

    elementIterator.innerHTML = sourceString;

    if ( elementIterator.children.length > 1 ) { // return document fragment
        let docFrag = document.createDocumentFragment();
        while (i = elementIterator.firstChild ) {
            docFrag.appendChild(i)
        }

        return docFrag;

    } else { // just return first element
        return elementIterator.firstElementChild;
    }

};

export default stringToElement;