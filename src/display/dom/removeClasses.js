/**
 *
 * Remove multiple classes from an Element. Support removing classes with wildcards
 *
 * @param element DOM element to remove classes from
 * @param patterns one or more class patterns. Patterns may be regular class names but can also contain `*` wildcards
 */
const removeClasses = function (element, ...patterns) {

    // save classes to avoid transforming the className of the element multiple times
    var classes = element.className;

    patterns.forEach( (pattern) => {

        let patternRegex = pattern.replace('*', '[a-zA-Z0-9-]+');
        patternRegex += '\\s?';

        patternRegex = new RegExp(patternRegex);

        classes = classes.replace( patternRegex, '' )

    } );

    // re assign new classes
    element.className = classes;

};

export default removeClasses;