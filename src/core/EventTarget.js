const EVENTS = '_EVENTS'; // Define a unique key for all instances to create event hash on
const LISTEN_TARGETS = '_LISTEN_TARGETS'; // Define a unique key for all instances to create a listen array on;

/**
 * The EventTarget is a class that allows the use of custom events in it's instances. it is an implementation of the
 * Pub/Sub pattern.
 *
 * It is generally not used directly but is inherited from in other classes
 *
 */
class EventTarget {

    /**
     * This MUST be called by sub-classes to instantiate the correct properties where events are stored.
     *
     */
    constructor() {

        /**
         * @private
         * @type {{}}
         */
        this[EVENTS] = {};

        /**
         * @private
         * @type {Array}
         */
        this[LISTEN_TARGETS] = [];

    }

    /**
     * Register an event handler for a type
     * @param {string} type - The type of the event. A custom human readable string.
     * @param {function} handler - The function that will be invoked when the event is triggered. No signature is provided, it is up to the developer to determine what is passed to the listener at trigger time
     * @param {Object} [context=this] - The object the listener will called on. Defaults to `this` and can be changed if event delegation is needed.
     */
    on(type, handler, context = this) {

        if (typeof type === 'string') {

            // ensure array of listeners for this type is available
            if ( !this.hasListeners(type) ) {
                this[EVENTS][type] = [];
            }

            this[EVENTS][type].push( {handler: handler, context : context} );

        } else { // Assume we have been passed an object of events.

            // loop over hash using key as type, and value as handler
            for ( const key in type) {
                if (type.hasOwnProperty(key)) {
                    let value = type[key];
                    this.on(key, value);
                }
            }

        }

    }

    /**
     * Register an event handler that will trigger only once
     * @param {string} type - The type of the event. A custom human readable string.
     * @param {function} handler - The function that will be invoked when the event is triggered. No signature is provided, it is up to the developer to determine what is passed to the listener at trigger time
     * @param {Object} [context=this] - The object the listener will called on. Defaults to `this` and can be changed if event delegation is needed.
     */
    once(type, handler, context = this) {

        // create surrogate handler that will execute once an remove event
        const onceHandler = (...eventData) => {
            handler.apply(this, eventData);
            this.off(type, onceHandler);
        };

        // register our surrogate event
        this.on(type, onceHandler, context);
    }

    /**
     * Remove event handler, either of one type, or just one listener
     * @param {string} type - The type of the event. A custom human readable string.
     * @param {function} [handler] - The event handler to be removed. If unspecififed, all handlers of the supplied type are removed.
     */
    off(type, handler) {

        if ( this.hasListeners(type) ) {

            if (typeof handler === "undefined") {
                this[EVENTS][type] = [];
            } else {
                const registeredHandler = this[EVENTS][type].find( (testHandler) => testHandler.handler === handler );
                if (registeredHandler !== -1) {
                    this[EVENTS][type].splice( this[EVENTS][type].lastIndexOf(registeredHandler) , 1);
                }
            }

        }

    }

    /**
     * Utility to allow EventTargets to listen to other EventTarget's events easily
     * @param {EventTarget} target - The instance of EventTarget to listen to events on
     * @param {string} type - The type of the event. A custom human readable string.
     * @param {function} handler - The function that will be invoked when the event is triggered. No signature is provided, it is up to the developer to determine what is passed to the listener at trigger time
     */
    listenTo(target, type, handler) {

        if ( !(target instanceof EventTarget) ) {
            throw new Error('Attempting to listenTo an object that does not inherit from EventTarget');
        }

        // Determine if we are listening to this object yet
        let targetListeners = this[LISTEN_TARGETS].find( (testTarget) => testTarget.target === target);

        // If target listeners doesn't exist yet, add it here
        if ( !targetListeners ) {
            targetListeners = {target : target, listeners : {} };
            this[LISTEN_TARGETS].push( targetListeners );
        }

        // make sure an array for this type of event is available
        targetListeners.listeners[type] = targetListeners.listeners[type] || [];

        // Add to register of functions
        targetListeners.listeners[type].push( handler );

        // bind event normally
        target.on(type, handler, this);

    }

    /**
     * Stop listening for events on another EventTarget
     * @param {EventTarget} target - The instance of EventTarget to stop receiving events from.
     * @param {string} type - The type of the event. A custom human readable string.
     */
    stopListening(target, type) {

        // Determine if we are listening to this object yet
        // var targetListeners = _.find(this[LISTEN_TARGETS], {target : target });
        const targetListeners = this[LISTEN_TARGETS].find( (testTarget) => testTarget === target);

        // If listeners are registered for this target
        if ( targetListeners ) {

            if (type) {

                targetListeners.listeners[type].forEach( function (handler) {
                    target.off(type, handler)
                });

            } else {

                for (let typeIter of Object.keys(targetListeners.listeners) ) {

                    targetListeners.listeners[typeIter].forEach( function (handler) {
                        target.off(typeIter, handler)
                    });

                }

            }

        }

    }

    /**
     * Determine if this object has events registered of a certain type
     * @param {string} type - Event type to check.
     * @returns {boolean} if the EventTarget has listeners for this type of event
     */
    hasListeners(type) {
        return typeof this[EVENTS][type] !== 'undefined'
    }

    /**
     * Trigger an event on this object
     * @param {string} type - The event type who's listeners will be triggered
     * @param {...*} eventParams - The parameters to be passed to the listening objects. Any number can be passed but it is recomended to only pass a single event object on which you may attach multiple properties.
     */
    trigger(type, ...eventParams) {

        // if an event of this type has been registered on this event
        if ( this.hasListeners(type) ) {

            // loop over listeners registered for this event type
            // note : could have used for of, but could need a Symbol polyfill which is too much code.
            const handlers = this[EVENTS][type];
            for ( const eventKey in handlers ) {

                if ( handlers.hasOwnProperty(eventKey) ) {
                    let event = this[EVENTS][type][eventKey];

                    event.handler.apply(event.context, eventParams);
                }

            }

        }

    }


}


export default EventTarget;