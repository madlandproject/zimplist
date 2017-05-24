import _ from 'lodash';

/**
 * Get index of searchCriteria in a collection of nodes or a parent searchCriteria
 * @param collection
 * @param searchCriteria
 */
const index = function (collection, searchCriteria) { // TODO invert parameters?

    let index = -1;

    // if collection parameter is an element, assume we want to find it's place among the other children of it's parent.
    if (_.isElement(collection)) {

        searchCriteria = collection;
        collection = Array.from(collection.parentNode.children);
    }

    // check the collection is an array
    if (_.isArray(collection)) {

        // search as literal object
        if (_.isElement(searchCriteria)) {
            index = _.indexOf(collection, searchCriteria);
            // search as CSS selector
        } else if (_.isString(searchCriteria)) {
            index = _.findIndex(collection, function (item) {
                return item.matches(searchCriteria);
            });
        } else {
            throw new Error('Search criteria must be an element or a String');
        }
    } else {
        throw new Error('Trying to get an index in a non-Array collection')
    }

    return index;

};

export default index;