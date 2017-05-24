import _ from 'lodash';

/**
 * Get index of searchCriteria in a collection of nodes (default is searchCritera's siblings
 * @param {Element|string} searchCriteria - An element or CSS selector to find an element
 * @param {Array<Element>} collection - The array of nodes to search in.
 * @returns {number} Index of the search criteria or -1 if the searchCritera was not found in this collection
 */
const index = function (searchCriteria, collection) {

    let index = -1;

    // if collection parameter isn't present or an element, assume we want to find it's place among the other children of it's parent.
    if ( !collection || !_.isElement(collection) ) {
        collection = Array.from(searchCriteria.parentNode.children);
    }

    // check the collection is an array
    if (_.isArray(collection)) {

        // search as literal object
        if (_.isElement(searchCriteria)) {
            index = _.indexOf(collection, searchCriteria);
            // search as CSS selector
        } else if (_.isString(searchCriteria)) {
            index = _.findIndex(collection, (item) => item.matches(searchCriteria) );
        } else {
            throw new Error('Search criteria must be an element or a String');
        }
    } else {
        throw new Error('Trying to get an index in a non-Array collection')
    }

    return index;

};

export default index;