import first from 'lodash/first';
import last from 'lodash/last';
import defaults from 'lodash/defaults';

import EventTarget from '../core/EventTarget';

/**
 *
 * These constants represent gestures that the touch instance will try to match
 *
 *
 */
const GESTURES_DEFINITIONS = {

    /*

     SWIPE DETECTOR

     */
    'swipe': {
        detect: function (events, options) {

            let detection = null;

            // only detect swipes with multiple events
            if (events.length > 1) {
                let firstEvent = first(events);
                let lastEvent = last(events);

                // Swipe with one finger only.
                if (!isMultiTouch(firstEvent) && !isMultiTouch(lastEvent)) {

                    let deltaX = lastEvent.touches[0].screenX - firstEvent.touches[0].screenX;
                    let deltaY = lastEvent.touches[0].screenY - firstEvent.touches[0].screenY;

                    let aDeltaX = Math.abs(deltaX);
                    let aDeltaY = Math.abs(deltaY);

                    // determine direction by comparison
                    if (aDeltaX > (2 * aDeltaY) && aDeltaX > options.swipeThreshold) {

                        detection = {
                            axis: 'x',
                            distance: {
                                x: deltaX,
                                y: deltaY
                            }
                        }

                    } else if ( options.verticalSwipe && aDeltaY > (2 * aDeltaX)) {

                        detection = {
                            axis: 'y',
                            distance: {
                                x: deltaX,
                                y: deltaY
                            }
                        }

                    }

                }
            }

            return detection;
        },
        dispatchEvent(target, eventData) {

            // create event
            let swipeEvent = document.createEvent('CustomEvent');
            swipeEvent.initCustomEvent('swipe', true, false, null);
            swipeEvent.distance = eventData.distance;
            swipeEvent.axis = eventData.axis;

            // dispatch it through the DOM
            target.dispatchEvent(swipeEvent);

        },
        repeat: false
    },

    /*

     ZOOM DETECTOR

     */
    'zoom': {
        detect: function (events) {
            let detection = null;

            // only detect zooms with multiple events
            if (events.length >= 2) {

                let first = events[events.length - 2];
                let last = events[events.length - 1];

                // detect multiple multi touch events
                if (isMultiTouch(first) && isMultiTouch(last)) {

                    // get distances for both points
                    let firstDistance = touchDistance(first);
                    let lastDistance = touchDistance(last);

                    // Zoom is onlt when fingers expand away from each other
                    if (firstDistance < lastDistance ) {

                        return {
                            distance : lastDistance,
                            center : touchCenter(last)
                        }
                    }
                }
            }

            return detection;
        },
        dispatchEvent(target, eventData) {

            // create event
            let swipeEvent = document.createEvent('CustomEvent');
            swipeEvent.initCustomEvent('zoom', true, false, null);
            swipeEvent.distance = eventData.distance;

            // dispatch it through the DOM
            target.dispatchEvent(swipeEvent);

        },
        repeat: true
    },

    'pinch': {
        detect: function (events) {
            let detection = null;

            // only detect zooms with multiple events
            if (events.length >= 2) {

                let first = events[events.length - 2];
                let last = events[events.length - 1];

                // detect multiple multi touch events
                if (isMultiTouch(first) && isMultiTouch(last)) {

                    // get distances for both points
                    let firstDistance = touchDistance(first);
                    let lastDistance = touchDistance(last);

                    if (firstDistance > lastDistance ) {

                        return {
                            distance : lastDistance,
                            center : touchCenter(last)
                        }
                    }
                }
            }

            return detection;
        },
        dispatchEvent(target, eventData) {

            // create event
            let swipeEvent = document.createEvent('CustomEvent');
            swipeEvent.initCustomEvent('zoom', true, false, null);
            swipeEvent.distance = eventData.distance;

            // dispatch it through the DOM
            target.dispatchEvent(swipeEvent);

        },
        repeat: true
    }

};

/**
 * Determines if event is detecting mutliple touch points.
 * @param {TouchEvent} event - The TouchEvent to test
 * @returns {boolean}
 */
function isMultiTouch(event) {
    return event.touches.length > 1;
}

/**
 * Get distance between two touches of an event. Simple square root.
 * @param {TouchEvent} event - A multi-touch native touch event
 * @returns {number} Distance in pixels between touches
 */
function touchDistance(event) {

    let a = event.touches[0];
    let b = event.touches[1];

    return Math.sqrt( Math.pow(b.clientX - a.clientX, 2) + Math.pow(b.clientY - a.clientY, 2) );
}

/**
 * Get center of touch event's touches.
 *
 * TODO handle more than 2 touches
 *
 * @param {TouchEvent} event - The native event to analyse.
 * @return {{x: number, y: number}} The center the supplied event's touches. If there is a single touch, it will return it's coordinates.
 */
function touchCenter(event) {
    if ( isMultiTouch(event) ) {

        let a = event.touches[0];
        let b = event.touches[1];

        let aX = a.clientX;
        let aY = a.clientY;

        let bX = b.clientX;
        let bY = b.clientY;

        //         start
        let x = aX + ((bX - aX) / 2);
        let y = aY + ((bY - aY) / 2);

        return {
            x : x,
            y : y
        }

    } else {
        let touch = event.touches[0];

        return {
            x : touch.clientX,
            y : touch.clientY
        }
    }
}


/**
 * Class to track simple touch gestures. Inspired partly by hammer.js
 *
 * @TODO make gestures optional, moving detectors into separate class
 * @TODO configure gesture detectors to avoid useless operations on multiple objects
 *
 */
class Touch extends EventTarget {

    /**
     * @param {Element} target - Target of touch events to listen to
     * @param {Object} options - Options for class behavior. See defaults for more info.
     */
    constructor(target, options = {}) {
        super();

        /**
         * Save event target
         * @type {Element}
         */
        this.target = target;

        /**
         * Saved options with default values.
         * @type {Object}
         */
        this.options = defaults(options, Touch.defaultOptions);

        // create and store bound functions that are used as event listeners
        this._touchEvents = {
            start: this._touchStartHandler.bind(this),
            move: this._touchMoveHandler.bind(this),
            end: this._touchEndHandler.bind(this)
        };

        // TODO handle {passive: true} in event listener
        this.target.addEventListener('touchstart', this._touchEvents.start);
        this.target.addEventListener('touchmove', this._touchEvents.move);
        this.target.addEventListener('touchend', this._touchEvents.end);

        // To help handling whole touch cycle (start -> move -> end) listen to the end event on the window too.
        if (this.options.bindWindowEnd) {
            window.addEventListener('touchend', this._touchEvents.end);
        }

    }

    /**
     * Get distance between first and last event points on both axis
     * @return {Number} Distance in pixels between first and last points currently tracked. Based on the first touch of a multi touch events
     */
    get distance() {

        // only return a number if there is a proper distance
        if ( !this._eventBuffer || this._eventBuffer.length < 2 ) {
            return NaN;
        } else {
            let a = this._eventBuffer[0].touches[0];
            let b = this._eventBuffer[ this._eventBuffer.length - 1 ].touches[0];

            return Math.sqrt( Math.pow(b.clientX - a.clientX, 2) + Math.pow(b.clientY - a.clientY, 2) );
        }

    }


    /**
     * Get distance between first and last event points on the X axis
     * @return {Number} Distance in pixels between first and last points currently tracked. Based on the first touch of a multi touch events
     */
    get distanceX() {
        // only return a number if there is a proper distance
        if ( !this._eventBuffer || this._eventBuffer.length < 2 ) {
            return NaN;
        } else {

            let a = this._eventBuffer[0].touches[0];
            let b = this._eventBuffer[ this._eventBuffer.length - 1  ].touches[0];

            return b.clientX - a.clientX;
        }
    }

    /**
     * Get distance between first and last event points on the Y axis
     * @return {Number} Distance in pixels between first and last points currently tracked. Based on the first touch of a multi touch events
     */
    get distanceY() {
        // only return a number if there is a proper distance
        if ( !this._eventBuffer || this._eventBuffer.length < 2 ) {
            return NaN;
        } else {

            let a = this._eventBuffer[0].touches[0];
            let b = this._eventBuffer[ this._eventBuffer.length - 1  ].touches[0];

            return b.clientY - a.clientY;
        }
    }

    /**
     * Remove native events and cleanup
     */
    destroy() {

        this.target.removeEventListener('touchstart', this._touchEvents.start);
        this.target.removeEventListener('touchmove', this._touchEvents.move);
        this.target.removeEventListener('touchend', this._touchEvents.end);

        if (this.options.bindWindowEnd) {
            window.removeEventListener('touchend', this._touchEvents.end);
        }

    }

    /* =======

     Private methods

     ======== */

    /**
     * Start tracking touch events on the target element.
     *
     * @param {TouchEvent} event - Native DOM event
     * @emits {TouchEvent} Native DOM event
     * @private
     */
    _start(event) {

        // in case 'end()' isn't called properly. Probably shouldn't happen.
        if (this.isTouched) this.end();

        /**
         * flag to indicate if there is actually a touch on the device.
         * @type {boolean}
         */
        this.isTouched = true;

        /**
         * Internal buffer of events to analyse. (re)initialised here with the first touch event as the only member
         * @type {TouchEvent[]}
         * @private
         */
        this._eventBuffer = [event];

        /**
         * Internal list of gestures currently being detected
         * @type {{}}
         * @private
         */
        this._currentGestures = {};

        this.trigger('start', event);
    }

    /**
     *
     * @param {TouchEvent} event - Native DOM event
     * @private
     */
    _move(event) {
        this._eventBuffer.push(event);

        // Run detectors
        // TODO move to sub-class
        for (let gesture in GESTURES_DEFINITIONS) {

            let gestureDef = GESTURES_DEFINITIONS[gesture];
            let gestureInfo = gestureDef.detect(this._eventBuffer, this.options);

            // if gesture detected
            if (gestureInfo) {

                // prevent repeat events on gestures that only should happen once per touch cycle (swipe for example). Could also be handled in touchend?
                if ( gestureDef.repeat || (!gestureDef.repeat && !this._currentGestures[gesture]) ) {

                    // attempt to prevent default
                    event.preventDefault();

                    // save gesture
                    this._currentGestures[gesture] = gestureInfo;

                    if (this.options.domEvents) {
                        gestureDef.dispatchEvent(this.target, gestureInfo);
                    }

                    this.trigger(gesture, gestureInfo);
                }

            }
        }


        this.trigger('move', event);

    }

    /**
     * End of touch. Reset internal vars
     * @param event - Native DOM event
     * @emits {TouchEvent} - Native DOM event
     * @private
     */
    _end(event) {

        // Trigger event before disposing of saved state
        this.trigger('end', event);

        this._eventBuffer = [];
        this.isTouched = false;

    }

    /* =======

     Event Handlers

     ======== */

    /**
     * Native start event handler
     * @param event
     * @private
     */
    _touchStartHandler(event) {

        // standard behviour is too disable scrolling and zooming on multi touch
        if (event.touches.length > 1) {
            event.preventDefault();
        }

        // if we're already touching, and another finger starts touching, treat it as a move
        if (this.isTouched) {
            this._move(event);
        } else {
            this._start(event);
        }

    }

    /**
     * Native move event handler
     * @param event
     * @private
     */
    _touchMoveHandler(event) {

        // standard behviour is too disable scrolling and zooming on multi touch
        if (event.touches.length > 1) {
            event.preventDefault();
        }

        this._move(event);
    }

    /**
     * Native end event handker
     * @param event
     * @private
     */
    _touchEndHandler(event) {
        this._end(event);
    }

}

/**
 * @static
 * @type {{verticalSwipe: boolean, swipeThreshold: number, domEvents: boolean}}
 */
Touch.defaultOptions = {

    /**
     * Detected y axis when detecting swipes. Very often we don't want to block scrolling.
     */
    verticalSwipe: false,

    /**
     * Minimum distance to trigger swipe event
     */
    swipeThreshold: 10,

    /**
     * Will create and trigger custom bubbling DOM events for gestures.
     */
    domEvents: true,

    /**
     * Listen to events on the window to avoid swiping logic out of element bounds
     */
    bindWindowEnd : false

};

export default Touch