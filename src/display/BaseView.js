// Third party dependencies
import _           from "lodash";

// UZIK dependencies
import EventTarget from "../core/EventTarget";
import WindowManager from "../utils/WindowManager";

/**
 * BaseView is the base class for organizing the DOM.
 * It is inspired by Backbone.js in certain regards, but is more ES6 and responsive friendly.
 *  *
 */
class BaseView extends EventTarget {

    constructor(el, options = {}) {

        super();

        // Check supplied el parameter
        if ( !el ) {
            throw new Error('You must specify a root element for the View');
        } else if ( !_.isElement(el) ) {
            throw new Error('Supplied `el` argument needs to be a DOMElement');
        }

        // Save supplied values
        this.el = el;
        this.options = _.defaults(options); // TODO merge options

        // Breakpoint handling
        if (this.options.breakpoints) { // use only supplied breakpoints
            this.breakpoints = _.filter( WindowManager.breakpoints, (bp) => _.includes(this.options.breakpoints, bp.name) );

        } else { // use all breakpoints
            this.breakpoints = _.clone( WindowManager.breakpoints );
        }

        // on first instantiation of any BaseView, bind the WindowManager.breakpoint handler
        if ( !BaseView.instances.length ) {
            WindowManager.on('breakpoint', breakpointHandler);
        }

        // Save newly created instance to static value
        BaseView.instances.push( this );

        // detect first breakpoint
        this.currentBreakpoint = _.findLast(this.breakpoints, (bp) => WindowManager.width >= bp.value );

    }

    /* ==========================

     Public Members

     ========================== */

    /**
     * Function is called when breakpoint is changed
     */
    breakpointChanged(breakpoint, previousBreakpoint) {
        this.currentBreakpoint = breakpoint;
    }

    /**
     *  Bind a DOMEvent to the view, optionally filtered on the selector.
     *
     * @param type {String} Event typoe
     * @param listener {Function} Event listener function that will be scoped to this view
     * @param selector {String|Element} [this.el] if selector is a String, the string will be used to test matching using delegated events to `this.el`. If it's an Element then bind event directly to that element
     *
     */
    addDomEvent(type, listener, selector = null) {

        // init domEvents registry if not present
        this._domEvents = this._domEvents || {};

        // init registry for this type
        this._domEvents[type] = this._domEvents[type] || [];

        // type check selector
        if ( selector && !( _.isString(selector) || _.isElement(selector) )) {
            throw new Error('Invalid selector passed to addDomEvent. Must be String or DOMElement');
        }

        if ( !_.isFunction(listener) ) {
            throw new Error('no event listener specified for addDomEvent');
        }

        // if the selector is an element, add event to it, otherwise use this.el for event delegation
        let target = ( _.isElement(selector) ) ? selector : this.el;

        // create internal listener that will be recorded
        let internalListener = (event) => {

            // init a flag to indicate if a selector has been found then go traverse up the DOM until this.el to see if an element matches
            let inSelector = false;
            let iterEl;

            if ( !selector ) {
                inSelector = true; // if no selector specified, always trigger
            } else {
                iterEl = event.target;

                if (_.isString(selector)) {

                    while (iterEl !== this.el) {

                        // when clicking on SVG <use> tags in IE,
                        // the event.target is actually the declaration element, and not the actual <use> tag
                        // in that case, switch reference to the actual <use /> tag
                        if ("correspondingUseElement" in iterEl) {
                            iterEl = iterEl.correspondingUseElement;
                        }

                        // .matches does't exist on SVG elements in old IE
                        if ( 'matches' in iterEl && iterEl.matches(selector)) {
                            inSelector = true;
                            break;
                        } else {
                            iterEl = iterEl.parentNode;
                        }
                    }

                } else if (_.isElement(selector)) {
                    iterEl = selector;
                    inSelector = true;
                }
            }

            if (inSelector) {
                // Add found selector to event and transparently trigger
                event.delegateTarget = iterEl;
                listener.apply(this, [event]);
            }

        };

        target.addEventListener(type, internalListener);

        this._domEvents[type].push({target : target, listener: internalListener});
    }

    /**
     * Remove DOM event from the element
     * @param type {String}
     * @param target {DOMElement}
     *
     */
    removeDomEvent(type = 'all', target) {

        if (this._domEvents) {

            let events;
            if (_.isUndefined(type) || type == 'all') {
                events = this._domEvents; // remove all events if no type is specified
            } else {
                events = {};
                events[type] = this._domEvents[type];
            }

            // for each event type
            _.each(events, (eventListeners, iterType) => {

                // we don't want to modify the array in place during the loop, so save removed event listeners to an array
                let removed = [];

                // loop over listener objects and remove
                _.each(eventListeners, (listenerObj, i) => {

                    if ( !target || listenerObj.target == target) {
                        listenerObj.target.removeEventListener(iterType, listenerObj.listener);
                        removed.push( i );
                    }

                });

                // remove of listener objects now
                removed.forEach( (i) => {
                    eventListeners.splice(i);
                });

                // Delete the object if there are no more listeners for this type
                if ( !eventListeners || eventListeners.length == 0) {
                    delete this._domEvents[iterType];
                }

            });
        }

    }

    /**
     * Remove  DOM event listeners and remove the View element from the DOM.
     */
    remove() {
        this.removeDomEvent();
        this.el.parentNode.removeChild(this.el);
    }

    /**
     * Removes DOM Element and DOM events. Unbinds other Events.
     * Call this to clean up the view before dereferencing it.
     */
    destroy() {
        this.stopListening();
        this.remove();

        // Remove from internal list of instances
        BaseView.instances.splice( BaseView.instances.indexOf(this), 1);

    }

    /**
     * Dummy function to implement resizing
     */
    resize() {

    }

    /**
     * Test to see if the viewport is currently at a certain breakpoint
     *
     * Proxies WindowManager.minWidth
     *
     * @param breakpoint {Number|String|Object} a breakpoint name, object or numerical value. See WindowManager.minWidth for more info
     * @returns {boolean}
     */
    minWidth(breakpoint) {
        return WindowManager.minWidth( breakpoint );
    }

    /* ==========================

     Private Members

     ========================== */



}

/**
 * Static array of instances
 * @type {Array}
 */
BaseView.instances = [];

/**
 * Single event handler from WindowManager breakpoint event. Handles calling of breakpointChanged on each instance if applicable
 * @param event
 */
function breakpointHandler(event) {
    for (let instance of BaseView.instances) {
        // get the max breakpoint this instance handles
        var usedBreakpoint = _.findLast(instance.breakpoints, (bp) => event.breakpoint.value >= bp.value );

        // Check it's not the current breakpoint and invoke breakpointChanged method
        if ( !_.isEqual(usedBreakpoint, instance.currentBreakpoint) ) {
            instance.breakpointChanged( usedBreakpoint, event.previous);
        }
    }
}


export default BaseView;