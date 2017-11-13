/**
 * Find the first parent that is scrollable. in most cases this will be the document itself.
 * @param {Element} el - The element we need to find the scroll parent for
 * @returns {Element}
 */
function getScrollParent(el) {

    // Default is HTML tag (or body tag in iOS). IE doesn't support scrollingElement
    let scrollParent = document.scrollingElement || document.documentElement;

    let elIter = el;
    while( elIter.parentNode && elIter !== document.documentElement ) {
        elIter = elIter.parentNode;

        if ( /(auto|scroll)/.test(window.getComputedStyle( elIter ).overflowY) ) {
            scrollParent = elIter;
            break;
        }
    }

    return scrollParent;
}

export default getScrollParent;