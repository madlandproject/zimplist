import _ from "lodash";

// browser prefixes
const PREFIXES = [
    'Webkit',
    'Moz',
    'MS',
    'O'
];

// Cache of modifier functions once the proper prefix has been found
const prefixedModifierCache = {};

// Test element for finding prefixed properties
const prefixTestEl = document.createElement('div');

/**
 * Create a prefixed aware CSS modifier for a property.
 *
 * Generated modifiers are stored in the cache declared above
 *
 * @param property
 * @private
 * @returns {function}
 */
function createModifier(property) {

    // get all prefixed properties (and un-prefixed in first position). prefixed properties are camel cased
    let prefixedProperties = [property].concat( _.map(PREFIXES, function(prefix){ return prefix + _.capitalize(property)}) );

    // find the first acceptable property name
    let prefixedPropName = _.find(prefixedProperties, function(prop){ return prop in prefixTestEl.style });

    // cache modifier to object
    prefixedModifierCache[property] = function(targetStyle, value) {
        targetStyle[prefixedPropName] = value;
    };

    return prefixedModifierCache[property];
}

/**
 * Style util to help setting and getting style properties
 *
 * @todo accept shorthand transform properties like x,y,scale,rotate.
 * @type {{set: Style.set, get: Style.get, addUnits: Style.addUnits, stripUnits: Style.stripUnits}}
 */
const Style = {

    /**
     * Set styles on an Element
     *
     * @param {Element} element - The element on which to set styles. Can also be the Element's style object directly.
     * @param {Object} properties - Object with properties as keys and values as
     */
    set : function (element, properties) {

        let elementStyles = ( _.isElement(element) ) ? element.style : element;

        // treat properties as an object of csspropertyname : value pairs
        for ( let prop in properties) {
            if (properties.hasOwnProperty(prop)) {

                // if a the value of this properties isn't already a string, format it.
                let specifiedValue = properties[prop];
                let finalValue;

                if (specifiedValue !== null) {
                    finalValue = _.isString(specifiedValue) ? specifiedValue : this.addUnits(prop, specifiedValue);
                } else {
                    finalValue = null;
                }

                // get cached or new modifier function and use it to modify element styles
                ( prefixedModifierCache[prop] || createModifier(prop) )(elementStyles, finalValue);
            }
        }

    },

    /**
     * Get style applied to this element
     *
     * TODO check on element.style object if we can detect !important rules someway
     *
     * @param element
     * @param property
     * @returns {string|number} the CSS value
     */
    get : function(element, property) {
        return this.stripUnits(property, window.getComputedStyle( element )[ property ] );
    },

    /**
     * Add units to the CSS value if possible. usefull for specifying pixel values as numbers
     *
     * @param {string} property - name of the CSS property
     * @param {string|number} value - value of the property that isn't a String
     * @param {string} [units='px'] - CSS unit for the value.
     * @returns {string} Value with appropriate units. be
     */
    addUnits : function(property, value, units = 'px') {

        let formattedValue;

        switch(property) {
            case 'top' :
            case 'right' :
            case 'bottom' :
            case 'left' :
            case 'minWidth' :
            case 'minHeight' :
            case 'width' :
            case 'height' :
                formattedValue = value.toString() + units;
                break;

            case 'opacity' :
                formattedValue = value;
                break;
        }

        // format to empty string
        if ( formattedValue === null ) formattedValue = '';

        return formattedValue;
    },

    /**
     * Strip units and return as a number if possible, otherwise return a string
     *
     * @param {string} property - the CSS property name
     * @param {*} value - CSS value as read from the browser.
     * @return {string|number} CSS value cast to number if possible
     */
    stripUnits : function (property, value) {

        let formattedValue;

        switch(property) {
            case 'top' :
            case 'right' :
            case 'bottom' :
            case 'left' :
            case 'minWidth' :
            case 'minHeight' :
            case 'width' :
            case 'height' :
            case 'opacity' :
                formattedValue = parseFloat( value );
                break;
        }

        return formattedValue

    }

};

export default Style;
