import _ from 'lodash';

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
                let first = _.first(events);
                let last = _.last(events);

                // Swipe with one finger only.
                if (!isMultiTouch(first) && !isMultiTouch(last)) {

                    let deltaX = last.touches[0].screenX - first.touches[0].screenX;
                    let deltaY = last.touches[0].screenY - first.touches[0].screenY;

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

                    if (firstDistance < lastDistance ) {

                        // TODO calc center point

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

function isMultiTouch(event) {
    return event.touches.length > 1;
}

/**
 * Get distance between two touches of an event
 * @param event
 * @returns {number} distance in pixels between touches
 */
function touchDistance(event) {

    let a = event.touches[0];
    let b = event.touches[1];

    let aX = a.clientX;
    let aY = a.clientY;

    let bX = b.clientX;
    let bY = b.clientY;

    return Math.sqrt( Math.pow(bX - aX, 2) + Math.pow(bY - aY, 2) );

}

/**
 * Get center of multi touch
 * @param event
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

        // console.log( aY, bY);

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
 * // TODO configure detectors to avoid useless operations on multiple objects
 *
 */
class Touch extends EventTarget {

    constructor(target, options = {}) {
        super();

        this.target = target;
        this.options = _.defaults(options, Touch.defaultOptions); // TODO use defaults

        // create and store bound functions that are used as event listeners
        this._touchEvents = {
            start: _.bind(this._touchStartHandler, this),
            move: _.bind(this._touchMoveHandler, this),
            end: _.bind(this._touchEndHandler, this)
        };

        this.target.addEventListener('touchstart', this._touchEvents.start);
        this.target.addEventListener('touchmove', this._touchEvents.move);
        this.target.addEventListener('touchend', this._touchEvents.end);

        if (this.options.bindWindowEnd) {
            window.addEventListener('touchend', this._touchEvents.end);
        }

    }

    /* =======

     Public methods

     ======== */
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

    _start(event) {

        // in case 'end()' isn't called properly // TODO can this happen?
        if (this.isTouched) this.end();

        // set 'touched' flag
        this.isTouched = true;

        // reset event buffer
        this._eventBuffer = [event];

        // reset current gestures
        this._currentGestures = {};

        this.trigger('start', event);

    }

    _move(event) {
        this._eventBuffer.push(event);

        // Run detectors
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

    _end(event) {
        this._eventBuffer = [];
        this.isTouched = false;

        this.trigger('end', event);
    }

    /* =======

     Event Handlers

     ======== */

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

    _touchMoveHandler(event) {

        // standard behviour is too disable scrolling and zooming on multi touch
        if (event.touches.length > 1) {
            event.preventDefault();
        }

        this._move(event);
    }

    _touchEndHandler(event) {
        this._end(event);
    }

}


Touch.defaultOptions = {

    verticalSwipe: false, // TODO rename. double negative
    swipeThreshold: 10,
    domEvents: true

};

export default Touch