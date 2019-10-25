// TODO remove lodash
import isElement from 'lodash/isElement';
// TODO remove lodash
import debounce from 'lodash/debounce';
// TODO remove lodash
import findIndex from 'lodash/findIndex';

import EventTarget from '../core/EventTarget';
import WindowManager from '../utils/WindowManager';
import Style from '../utils/Style';
import getDocumentRect from '../display/getDocumentRect';

class Tracker extends EventTarget {

    constructor(el, offset = 1) {
        super();

        this.el = el;
        this.offset = offset;
        this.side = null;
        this.state = null;

    }

}


/**
 *
 *  Scrolling tracker allows us to know when an element is off screen, overlapping the screen or completely on screen.
 *  It also allows us to know which side the center of the element is (top or bottom) *
 *
 * @todo untrack elements
 *
 */
class ScrollingTracker extends EventTarget {

    constructor(scrollContainer = window) {
        super();

        /**
         * @type {Window}
         */
        this.scrollContainer = scrollContainer;

        this._trackers = [];

        if (scrollContainer === window) {
            this.listenTo( WindowManager, 'scroll', this._windowScrollHandler);
        } else {
            // create our own scroll handler if scrolling an element
            this._scrollHandler = this._windowScrollHandler.bind( this );
            scrollContainer.addEventListener( 'scroll', this._scrollHandler );
        }

        this.listenTo( WindowManager, 'resize', this._windowResizeHandler);

    }

    /*

     Public methods

     */

    /**
     * Start tracking the scrollPosition of an element
     * @param {Element} el - The element to track.
     * @param {Number} offset - A ratio of the total height
     * @returns {Tracker} A tracker object that will emit events
     */
    trackElement(el, offset = 1) {

        let tracker = new Tracker(el, offset);

        this._trackers.push( tracker );

        this.refreshElementMetrics(tracker);

        this._update(false);

        return tracker;

    }

    untrackElement(elOrTracker) {

        let trackerIndex;

        if (elOrTracker instanceof Tracker) {
            trackerIndex = this._trackers.indexOf( elOrTracker );
        } else {
            trackerIndex = findIndex(this._trackers, {el: elOrTracker});
        }

    }

    /**
     *
     * @param {Element|Tracker} elOrTracker - Element or Tracker object that needs to be refreshed
     */
    refreshElementMetrics(elOrTracker) {

        let trackers;

        if ( !elOrTracker ) {
            trackers = this._trackers;
        } else if ( isElement(elOrTracker)  ) {
            trackers = this._trackers.find(tracker => tracker === elOrTracker);
        } else if ( elOrTracker instanceof Tracker ) {
            trackers = [elOrTracker];
        }


        trackers.forEach( tracker => {

            // Save & remove transforms
            const isInlineTransformStyle = /transform\s*:\s*[a-z0-9]+/i.test( tracker.el.getAttribute('style') );
            const isInlineTransitionStyle = /transition\s*:\s*[a-z0-9]+/i.test( tracker.el.getAttribute('style') );

            const currentTransform  = Style.get( tracker.el, 'transform' );
            const currentTransition = Style.get( tracker.el, 'transition' );

            Style.set( tracker.el, {
                transform : 'none',
                transition : 'none'
            });

            // Measure and save metrics to tracker
            const elementMetrics = getDocumentRect(tracker.el);

            // apply offset
            const height = elementMetrics.height * tracker.offset;
            const top = elementMetrics.top +    ((elementMetrics.height - height) / 2);

            tracker.top = top;
            tracker.height = height;

            // re-apply Transforms and transitions if they were removed
            if (currentTransform && isInlineTransformStyle) {
                Style.set(tracker.el, {transform: currentTransform});
            } else {
                tracker.el.style.removeProperty('transform');
            }

            if (currentTransition || isInlineTransitionStyle) {
                Style.set(tracker.el, {transition: currentTransition});
            } else {
                tracker.el.style.removeProperty('transition');
            }



        });

        this._update(false);

    }

    /*

    Private methods

     */

    _getScrollContainerScrollTop() {
        return (this.scrollContainer === window ) ? WindowManager.scrollPosition.top : this.scrollContainer.scrollTop;
    }

    _getScrollContainerHeight() {
        return (this.scrollContainer === window ) ? WindowManager.height : this.scrollContainer.offsetHeight;
    }

    _update(triggerEvents = true) {

        let screenTop = this._getScrollContainerScrollTop();
        let screenHeight = this._getScrollContainerHeight();
        let screenBottom = screenTop + this._getScrollContainerHeight();

        this._trackers.forEach( tracker => {

            let currentState = tracker.state;
            let currentSide = tracker.side;
            let newState;
            let newSide;

            let trackerTop = tracker.top;
            let trackerBottom = tracker.top + tracker.height;

            // State checking :

            // Check if element is OFF screen
            if (screenBottom < trackerTop || // off and below
                screenTop > trackerBottom) {  // off and above

                newState = ScrollingTracker.STATE.OFF;

            // Check if element is OVERLAPPING the screen
            } else if ((screenTop < trackerTop && screenBottom < trackerBottom) || // overlap bottom
                (screenTop > trackerTop && screenTop < trackerBottom) && // overlap above
                !(screenTop > trackerTop && screenBottom < trackerBottom )) { // when an element is higher than  the screen, this avoids it never becoming on {

                newState = ScrollingTracker.STATE.OVERLAP;

            // If element is neither OFF or OVERLAPPING, it must be ON
            } else {
                newState = ScrollingTracker.STATE.ON;
            }

            // Side checking :
            newSide = ( trackerTop + (tracker.height * 0.5) < screenTop + (screenHeight * 0.5) ) ? ScrollingTracker.SIDE.ABOVE : ScrollingTracker.SIDE.BELOW;

            // Determine if state or side has actually changed
            let updateState = (newState !== currentState);
            let updateSide = (newSide !== currentSide);

            // save values to tracker before emitting events for consistency.
            tracker.state = newState;
            tracker.side = newSide;

            if (triggerEvents) {

                if (updateState) {
                    let eventObject = {
                        state : newState,
                        target: tracker
                    };

                    tracker.trigger('state', eventObject);
                    tracker.trigger(`state:${newState}`, eventObject);
                    this.trigger('element:state', eventObject);
                }

                if (updateSide) {

                    let eventObject = {
                        side : newSide,
                        target : tracker
                    };

                    tracker.trigger('side', eventObject);
                    tracker.trigger(`side:${newSide}`, eventObject);
                    this.trigger('element:side', eventObject);
                }
            }

        });

    }


    /*

    Event handlers

     */

    // TODO rename because of div scrolling support
    _windowScrollHandler(event) {
        this._update();
    }

    _windowResizeHandler(event) {
        this.refreshElementMetrics();
    }

}

// Position relateive to the viewport
ScrollingTracker.STATE = {
    ON: 'on',
    OFF: 'off',
    OVERLAP: 'overlap'
};

// Side, determine if the element is below or above the screen. This also depends on the element height
ScrollingTracker.SIDE = {
    ABOVE: 'above',
    BELOW: 'below'
};

ScrollingTracker.DIRECTION = {
    UP: -1,
    DOWN: 1
};

export {ScrollingTracker as default, Tracker};
