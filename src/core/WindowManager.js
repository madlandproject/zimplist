// TODO test replacement
import defaults from '../utils/defaults';
// TODO test replacement
import throttle from '../utils/throttle';
// TODO test replacement
import findLast from '../utils/findLast';

import EventTarget  from './EventTarget';

// Cross platform function to get scroll position
// TODO test on modern browsers for simplifcation
const getScrollTop = function () {
    return window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
};

const getScrollLeft = function () {
    return window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft || 0;
};

class WindowManager extends EventTarget{

    initialize (config) {

        if ( !this.initialized ) {
            this.config = defaults(config || {}, WindowManager.defaultConfig);

            /**
             * Array of breakpoints. You can not change breakpoints once they are set
             * @type {Array}
             */
            this.breakpoints = this.config.breakpoints;

            // Freeze breakpoints
            this.breakpoints.forEach( bp => Object.freeze(bp) );

            // Create and save Event Handlers
            this._domEvents = {};
            this._domEvents.resize  = throttle(this._resizeHandler.bind(this), this.config.resizeThrottle);
            this._domEvents.load    = this._loadHandler.bind(this);
            this._domEvents.unload  = this._unloadHandler.bind(this);
            this._domEvents.scroll  = throttle( this._scrollHandler.bind(this), this.config.scrollThrottle);

            // listen for events
            window.addEventListener('resize', this._domEvents.resize);
            window.addEventListener('load',   this._domEvents.load);
            window.addEventListener('unload', this._domEvents.unload);

            this.bindScrollEvent();

            // set up variable tracking
            this.scrollPosition = this.scrollPosition || {top: getScrollTop()};

            // cache window metrics now
            this._updateMetrics();
            this._updateScrollMetrics();

            this._detectBreakpoint(true);

            this.initialized = true;

        }

    }

    /* ==========================

     Public Members

     ========================== */

    // Allow scroll event to be detached from window. Useful for virtual scrolling. (shout out to MG, he'll love it)
    /**
     * Start listening for native window scroll events
     */
    bindScrollEvent() {
        window.addEventListener('scroll', this._domEvents.scroll);
    }

    /**
     * Stop listening for native window scroll events
     */
    unbindScrollEvent() {
        window.removeEventListener('scroll', this._domEvents.scroll);
    }

    /**
     * Scroll to this position in the window. Updates the internal variables.
     * @param {number} y - Move scroll to to here
     * @param {number} x - Move scroll left to here.
     */
    scrollTo(y = 0, x = 0) {

        this.scrollPosition.top = y;
        this.scrollPosition.left = x;

        window.scrollTo(x, y);
    }

    /**
     * Determine if the viewport is of a a minimum width
     *
     * @param {Object|String|Number} breakpoint - If of type object, assumes to be a named breakpoint object with a value property.
     *  If a string, a named breakpoint's name. If a number the breakpoint's value. A number maybe used to arbitrarily check window width
     * @returns {boolean} if the viewport is at least of breakpoint size.
     */
    minWidth(breakpoint) {

        // Get numerical value for breakpoint
        let breakpointValue;
        let breakpointType = (typeof breakpoint).toLowerCase();
        if ( breakpointType === 'number' ) {
            breakpointValue = breakpoint;
        } else if ( breakpointType === 'string' ) {
            breakpointValue = this.breakpoints.find(bp => bp.name === breakpoint).value;
        } else if ( breakpointType === 'object' || breakpointType === 'function' ) {
            breakpointValue = breakpoint.value;
        }

        return this.width >= breakpointValue;
    }

    /* ==========================

     Private Members

     ========================== */
    /**
     * Save the window metrics to this object
     * @private
     */
    _updateMetrics() {
        this.width = window.document.documentElement.clientWidth;
        this.height = window.document.documentElement.clientHeight;
    }

    /**
     * Update internal var that tracks the scroll position
     * @private
     */
    _updateScrollMetrics() {
        this.scrollPosition.top = getScrollTop();
        this.scrollPosition.left = getScrollLeft();
    }

    /**
     * Called on window resize events to detect which breakpoint we're on
     *
     * @param {Boolean} [suppressEvents=false] - Do not trigger a breakpoint event when a change is detected
     * @private
     */
    _detectBreakpoint(suppressEvents = false) {

        // find biggest matching BP
        let breakpoint = findLast(this.breakpoints, (bp) => {
            return this.width >= bp.value;
        });

        // ony if the breakpoint has changed
        if (this.currentBreakpoint !== breakpoint) {
            let previousBreakpoint = this.currentBreakpoint;
            this.currentBreakpoint = breakpoint;

            // dispatch event for breakpoint, simply cloning the BP object for the event data
            if (!suppressEvents) {
                this.trigger('breakpoint', {breakpoint: breakpoint, previous : previousBreakpoint});
            }
        }

    }

    /* ==========================

     Event Handlers

     ========================== */
    /**
     * Internal window scroll handler. This call is throttled
     * @param event
     * @private
     */
    _scrollHandler(event) {
        const previousTop = this.scrollPosition.top;
        this._updateScrollMetrics();
        const currentTop = this.scrollPosition.top;

        // determine direction by comparing previous scroll position
        const direction = (previousTop < currentTop) ? 1 : -1;

        // trigger custom event
        this.trigger('scroll', {scrollPosition: this.scrollPosition, direction : direction, originalEvent: event});
    }

    /**
     * Internal window resize handler. This call is throttled
     * @private
     */
    _resizeHandler() {
        this._updateMetrics();
        this._detectBreakpoint();
        this.trigger('resize', {width: this.width, height: this.height});
    }

    /**
     * Called when the window unloads
     * @private
     */
    _unloadHandler() {
        this.trigger('unload');
    }

    /**
     * Forward the window load event
     * @private
     */
    _loadHandler() {
        this.trigger('load');
    }

}

WindowManager.defaultConfig = {
    scrollThrottle: 15, // number of ms between scroll events
    resizeThrottle: 50, // number of ms between resize events
    disableScrollClass: null, // class name to use for the disable scroll class. default is to apply styles directly
    disableUserInputClass: null, // class name to use for the disable user input class. default is to apply styles directly
};

// Export singleton by default and Class if introspection needed
export default new WindowManager();
