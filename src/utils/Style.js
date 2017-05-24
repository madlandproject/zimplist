import _ from "lodash";

// browser prefixes
const prefixes = [
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
 * Generated modifiers are stored in the const above
 *
 * @param property
 * @returns {*}
 */
function createModifier(property) {
    // prefixed properties are camel cased
    let propertyCap = _.capitalize(property);

    // get all prefixed properties (and un-prefixed in first position)
    let prefixedProperties = [property].concat( _.map(prefixes, function(prefix){ return prefix + propertyCap}) );

    // find the first acceptable property name
    let prefixedPropName = _.find(prefixedProperties, function(prop){ return prop in prefixTestEl.style });

    // cache modifier to object
    prefixedModifierCache[property] = function(targetStyle, value) {
        targetStyle[prefixedPropName] = value;
    };

    return prefixedModifierCache[property];
}

/**
 * Style util
 *
 * @type {{set: Style.set, get: Style.get, formatValue: Style.formatValue}}
 */
const Style = {

    set : function (element, property, value) {

        let elementStyles =  ( _.isElement(element) ) ? element.style : element;

        // internally we always use an object and loop over its keys and values
        let propObj;

        // convert string to use in object, or just use object
        if (_.isString(property)) {
            propObj = {};
            propObj[property] = value
        } else {
            propObj = property;
        }

        // treat property as an object of csspropertyname : value pairs
        for ( let prop in propObj) {
            if (propObj.hasOwnProperty(prop)) {

                // if a the value of this property isn't already a string, format it.
                let specifiedValue = propObj[prop];
                let finalValue;

                if (specifiedValue !== null) {
                    finalValue = _.isString(specifiedValue) ? specifiedValue : this.formatValue(prop, specifiedValue);
                } else {
                    finalValue = null;
                }


                // get cached or new modifier function
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
     * @returns {*}
     */
    get : function(element, property) {
        return window.getComputedStyle( element )[ property ];
    },

    /**
     *
     * @param property name of the CSS property
     * @param value value of the property that isn't a String
     * @param units
     * @returns {*}
     */
    formatValue : function(property, value, units = 'px') {

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
        if ( formattedValue === null) formattedValue = '';

        return formattedValue;
    }

};

export default Style;
