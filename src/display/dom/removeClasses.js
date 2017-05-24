/**
 * Remove multiple classes from an Element. Supports removing classes with `*` wildcard
 *
 * @param {Element} el - DOM element to remove classes from
 * @param {...string} patterns - One or more class patterns. Patterns must be CSS class names but can also contain `*` as a wildcard.
 */
const removeClasses = function (el, ...patterns) {

    // save classes to avoid transforming the className of the el multiple times
    var classes = el.className;

    patterns.forEach( (pattern) => {

        // replace wildcard with regex, add space matcher after for elements with multiple classes
        let patternRegex = new RegExp( pattern.replace('*', '[a-zA-Z0-9-_]+') + '\\s?' );

        // remove classes using Regex
        classes = classes.replace( patternRegex, '' )

    } );

    // re assign new classes to the element
    el.className = classes;

};

export default removeClasses;