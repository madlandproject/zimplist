import EventTarget from '../core/EventTarget';

/**
 * Mouse class provides a small abstraction layer to make Mouse events more EventTarget friendly
 *
 * TODO handle dragging
 *
 */
class Mouse extends EventTarget {

    constructor(target = window) {
        super();

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

    destroy() {
        this.target.removeEventListener('mousemove', this._mouseEvents.move);
    }

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
