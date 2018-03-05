import getScrollParent from './dom/getScrollParent';

const getDocumentRect = function(el) {

    let elRect = el.getBoundingClientRect();

    const scrollEl = getScrollParent( el );

    return {
        top : elRect.top + scrollEl.scrollTop,

        left: elRect.left + scrollEl.scrollLeft,

        width   : elRect.width,
        height  : elRect.height,

        right   : elRect.right + scrollEl.scrollLeft,
        bottom  : elRect.bottom + scrollEl.scrollTop
    };

};

export default getDocumentRect;