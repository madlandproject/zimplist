import _            from "lodash";
import EventTarget  from "../core/EventTarget";

// Cross platform function to get scroll position
const getScrollTop = function () {
    return window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
};

let WindowManager;

class WindowManagerClass extends EventTarget{

    constructor() {
        // Singleton check
        if ( WindowManager ) {
            throw new Error("WindowManager is a Singleton, an instance already exists");
        }

        super();
    }

    /* ==========================

     Initialization function

     ========================== */
    initialize (config) {

        if ( !this.initialized ) {
            this.config = _.defaults(config || {}, WindowManagerClass.defaultConfig);

            this.breakpoints = this.config.breakpoints;

            // Create and save Event Handlers
            this._domEvents = {};
            this._domEvents.resize  = _.throttle(_.bind(this._resizeHandler, this), this.config.resizeThrottle);
            this._domEvents.load    = _.bind(this._loadHandler, this);
            this._domEvents.unload  = _.bind(this._unloadHandler, this);
            this._domEvents.scroll  = _.throttle(_.bind(this._scrollHandler, this), this.config.scrollThrottle);

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

    // Allow binding & unbinding of scroll events
    bindScrollEvent() {
        window.addEventListener('scroll', this._domEvents.scroll);
    }

    unbindScrollEvent() {
        window.removeEventListener('scroll', this._domEvents.scroll);
    }

    scrollTo(y = 0, x = 0) {
        window.scrollTo(y, x);

        this.scrollPosition.top = y;
        this.scrollPosition.left = x;
    }

    /**
     * Determine if the viewport is of a a minimum width
     *
     * @param {Object|String|Number} breakpoint. If of type object, assumes to be a named breakpoint object with a value propert, if a string, a named breakpoint's name, if a number the breakpoint's value. A number maybe used to arbitrarily check window width
     * @returns {boolean}
     */
    minWidth(breakpoint) {

        // Get numerical value for breakpoint
        let breakpointValue;
        if ( _.isNumber(breakpoint) ) {
            breakpointValue = breakpoint;
        } else if ( _.isString(breakpoint) ) {
            breakpointValue = _.find( this.breakpoints, {name: breakpoint}).value;
        } else if ( _.isObject(breakpoint) ) {
            breakpointValue = breakpoint.value;
        }

        return this.width >= breakpointValue;
    }

    /* ==========================

     Private Members

     ========================== */
    _updateMetrics() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
    }

    _updateScrollMetrics() {
        this.scrollPosition.top = getScrollTop();
    }

    /**
     * Called on window resize events to detect which breakpoint we're on
     *
     * @param supressEvents
     * @private
     */
    _detectBreakpoint(supressEvents) {

        // find biggest matching BP
        var breakpoint = _.findLast(this.breakpoints, (bp) => {
            return this.width >= bp.value;
        });

        // ony if the breakpoint has changed
        if (this.currentBreakpoint != breakpoint) {
            let previousBreakpoint = this.currentBreakpoint;
            this.currentBreakpoint = breakpoint;

            // dispatch event for breakpoint, simply cloning the BP object for the event data
            if (!supressEvents) {
                this.trigger('breakpoint', {breakpoint: _.clone(breakpoint), previous : _.clone(previousBreakpoint)}); // TODO make breakpoints immutable
            }
        }

    }

    /* ==========================

     Event Handlers

     ========================== */
    _scrollHandler(event) {
        var previousTop = this.scrollPosition.top;
        this._updateScrollMetrics();
        var currentTop = this.scrollPosition.top;

        // determine direction by comparing previous scroll position
        var direction = (previousTop < currentTop) ? 1 : -1;

        // trigger custom event
        this.trigger('scroll', {scrollPosition: this.scrollPosition, direction : direction, originalEvent: event});
    }

    _resizeHandler(event) {
        this._updateMetrics();
        this.trigger('resize', {width: this.width, height: this.height});
        this._detectBreakpoint();
    }

    _unloadHandler() {
        // window.scrollTo(0, 0);
    }

    _loadHandler() {
        this.trigger('load');
    }

}

WindowManagerClass.defaultConfig = {
    scrollThrottle: 15, // number of ms between scroll events
    resizeThrottle: 50, // number of ms between resize events
    disableScrollClass: null, // class name to use for the disable scroll class. default is to apply styles directly
    disableUserInputClass: null, // class name to use for the disable user input class. default is to apply styles directly
};

// Create our Singleton
WindowManager = new WindowManagerClass();

// Export singleton by default and Class if introspection needed
export {WindowManager as default, WindowManagerClass};
