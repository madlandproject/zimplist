import EventTarget from '../core/EventTarget';

/**
 * Mouse class provides a small abstraction layer to make Mouse events more EventTarget friendly
 *
 * @todo handle dragging
 *
 */
class Mouse extends EventTarget {

    /**
     * @param {Element|Window} target - Object to listen for mouse events on.
     */
    constructor(target = window) {
        super();

        /**
         * DOM event target
         * @type {Element|Window}
         */
        this.target = target;

        this.position = {
            x : 0,
            y : 0
        };

        // setup events
        this._mouseEvents = {
            move : this._mouseMoveHandler.bind( this )
        };

        target.addEventListener('mousemove', this._mouseEvents.move);

    }

    /**
     * Remove DOM events and cleanup.
     */
    destroy() {
        this.target.removeEventListener('mousemove', this._mouseEvents.move);
    }

    /**
     * Saves the current mouse current client position before forwarding the event
     *
     * @param {MouseEvent} event - The native DOM event
     * @emits {MouseEvent} event - The native DOM event
     * @private
     */
    _mouseMoveHandler(event) {

        // save latest points
        this.position = {
            x : event.clientX,
            y : event.clientY
        };

        this.trigger('move', event);

    }

}

export default Mouse;
