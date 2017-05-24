import EventTarget from '../core/EventTarget';

/**
 * Mouse class provides a small abstraction layer to make Mouse events more EventTarget friendly
 *
 * TODO handle dragging
 *
 */
class Keyboard extends EventTarget {

    constructor(target = window.document) {
        super();

        this.target = target;

        // setup events
        this._keyboardEvents = {
            press   : this._keyPressHandler.bind( this ),
            down    : this._keyDownHandler.bind( this )
        };

        target.addEventListener('keypress', this._keyboardEvents.press);
        target.addEventListener('keydown', this._keyboardEvents.down);

    }

    destroy() {
        this.target.removeEventListener('keypress', this._keyboardEvents.press);
        this.target.removeEventListener('keydown', this._keyboardEvents.down);
    }

    _keyPressHandler(event) {


        // save latest points
        this.trigger('press', event);

    }

    _keyDownHandler(event) {

        // console.log(event);

        // get char
        let symbol = Keyboard.codes[ event.keyCode ];

        event.symbol = symbol;

        // save latest points
        this.trigger('down', event);
    }

}

// constant type values for comparison
Keyboard.keys = {};
Keyboard.keys.ESC       = 27;

// Inverse lookup for keyboard values;
Keyboard.codes = []
Keyboard.codes[ 27 ]    = 'ESC';





export default Keyboard;
