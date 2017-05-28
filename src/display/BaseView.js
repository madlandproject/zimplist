// Third party dependencies
import _           from "lodash";

// Zimple dependencies
import EventTarget from "../core/EventTarget";
import WindowManager from "../utils/WindowManager";

/**
 * BaseView is the base class for organizing the DOM. It extends EventTarget to allow event based communication between
 * Views and their parents or other parts of the application that also inherit from EventTarget.
 *
 * BaseView enables easily adding DOM Events by doing the book keeping and allowing for event delegation.
 */
class BaseView extends EventTarget {

    /**
     *
     * @param {Element} el - The Element this view is responsible for. Saved to this.el, a View is always responsible
     *      For a single root element. The view can then split up it's contained elements with subviews
     * @param {Object} options - An object of options for the view
     * @param {Array} options.breakpoints - An array of breakpoint objects the view uses. If this options is specified,
     *      the `breakpointChanged` function will only be called with breakpoints specified here, otherwise it will be called
     *      for every breakpoint change.
     */
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
        this.options = options;

        // Breakpoint handling
        if (this.options.breakpoints) { // react only breakpoints specified in the options
            this.breakpoints = _.filter( WindowManager.breakpoints, (bp) => _.includes(this.options.breakpoints, bp.name) );

        } else { // use all breakpoints
            this.breakpoints = _.clone( WindowManager.breakpoints );
        }

        // on first instantiation of any BaseView, bind the WindowManager.breakpoint handler
        if ( !BaseView.instances.length ) {
            WindowManager.on('breakpoint', breakpointHandler);
        }

        // Save newly created instance to static array.
        BaseView.instances.push( this );

        // detect first breakpoint
        this.currentBreakpoint = _.findLast(this.breakpoints, (bp) => WindowManager.width >= bp.value );

    }

    /**
     * Function is called when breakpoint is changed
     * @param {Object} breakpoint - New breakpoint obejct
     * @param {Object} previousBreakpoint - Breakpoint the browser was resized from.
     */
    breakpointChanged(breakpoint, previousBreakpoint) {
        this.currentBreakpoint = breakpoint;
    }

    /**
     *  Bind a DOMEvent to the view, optionally filtered on the selector.
     *
     * @param {String} type - Event typoe
     * @param {Function(event)} listener - Event listener function that will be scoped to this view
     * @param {String|Element} [selector=this.el] - If selector is a String, the string will be used to test matching using
     *      delegated events to `this.el`. If it's an Element then bind event directly to that element.
     *      Binding directly to an element is usefull for events that don't bubble. (form submit, for example)
     */
    addDomEvent(type, listener, selector = null) {

        // init domEvents registry if not present
        this._domEvents = this._domEvents || {};

        // init registry for this type
        this._domEvents[type] = this._domEvents[type] || [];

        // Check selector is either a valid string or an element
        if ( selector && !( (_.isString(selector) && selector !== 'all') || _.isElement(selector) )) {
            throw new Error('Invalid selector passed to addDomEvent. Must be String or DOMElement. Can not be "all"');
        }

        // check we have a function to bind to.
        if ( !_.isFunction(listener) ) {
            throw new Error('no event listener function specified for addDomEvent');
        }

        // if the selector is an element, add event to it, otherwise use this.el for event delegation
        let target = _.isElement(selector) ? selector : this.el;

        // create internal listener that will be saved
        let internalListener = (event) => {

            // init a flag to indicate if a selector has been found
            let inSelector = false;

            // create element iterator that will climb up the DOM.
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

                } else if (_.isElement(selector)) { // If selector is an Element, then it is our target and will always match
                    iterEl = selector;
                    inSelector = true;
                }
            }

            if (inSelector) {
                // Add found selector to event and transparently trigger our listener
                event.delegateTarget = iterEl;
                listener.apply(this, [event]);
            }

        };

        // Native dom event
        target.addEventListener(type, internalListener);

        // Save event object
        this._domEvents[type].push({target : target, listener: internalListener});
    }

    /**
     * Remove DOM event from the element
     * @param {Element} target - The element to remove events from
     * @param {String} [type='all'] - The DOM event Type. Special keyword 'all' removes all event types
     */
    removeDomEvent(target, type = 'all') {

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
     * Remove all DOM event listeners and remove the View element from the DOM. This function is used when we want to
     * remove the element from the DOM but want the view to stay in memory
     */
    remove() {
        this.removeDomEvent();
        this.el.parentNode.removeChild(this.el);
    }

    /**
     * Removes DOM Element and DOM events. Unbinds other Events.
     * Call this to clean up the view before de-referencing it.
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

}

/**
 * Static array of instances
 * @static
 * @private
 * @type {Array<BaseView>}
 */
BaseView.instances = [];

/**
 * Single event handler from WindowManager breakpoint event. Handles calling of breakpointChanged on each instance if applicable
 * @private
 * @static
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