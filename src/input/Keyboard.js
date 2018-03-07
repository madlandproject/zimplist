import EventTarget from '../core/EventTarget';

/**
 * Keyboard class provides a small abstraction layer to make Keyboard events more EventTarget friendly
 *
 */
class Keyboard extends EventTarget {

    /**
     *
     * @param {Element} [target=window.document] - The element to listen to events to. Defaults to the document.
     */
    constructor(target = window.document) {
        super();

        /**
         * DOM event target
         * @type {Element}
         */
        this.target = target;

        /**
         * @private
         */
        this._keyboardEvents = {
            press   : this._keyPressHandler.bind( this ),
            down    : this._keyDownHandler.bind( this )
        };

        target.addEventListener('keypress', this._keyboardEvents.press);
        target.addEventListener('keydown', this._keyboardEvents.down);

    }

    /**
     * Stop listening for events
     */
    destroy() {
        this.target.removeEventListener('keypress', this._keyboardEvents.press);
        this.target.removeEventListener('keydown', this._keyboardEvents.down);
    }

    /**
     * Keypress handler
     * @param {Event} event - DOM Event object
     * @emits {Event} Native event
     * @private
     */
    _keyPressHandler(event) {
        // forward event
        this.trigger('press', event);
    }

    /**
     * Keydown event. Adds symbol to event object before forwarding it.
     * @param {Event} event - DOM event
     * @emits {Event} Native event
     * @private
     */
    _keyDownHandler(event) {

        // get char
        event.symbol = Keyboard.codes[ event.keyCode ];

        // save latest points
        this.trigger('down', event);
    }

}

// constant type values for comparison
Keyboard.keys = {};
Keyboard.keys.ESC       = 27;

// Inverse lookup for keyboard values;
Keyboard.codes = [];
Keyboard.codes[ 27 ]    = 'ESC';


export default Keyboard;
