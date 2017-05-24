// Third party dependencies
// import _ from "lodash";

// UZIK Depedencies


// Local app Dependencies
import BaseView          from '../BaseView';


// Hidden consts

/**
 *
 */
class TextInput extends BaseView {

    constructor(el, options) {

        super(el, options);

        this.parent         = el.parentNode;
        this.labelText      = this.parent.querySelector('.label-text');

        if (this.el.value.length > 0) {
            this._hideLabel();
        }

        this.addDomEvent('focus', this._inputClickHandler);
        this.addDomEvent('input', this._inputTypingHandler);
        this.addDomEvent('click', this._inputClickHandler, this.labelText);

    }

    /* ==========================

     Public Methods

     ========================== */

    breakpointChanged(breakpoint, previousBreakpoint) {

    }

    /* ==========================

     Private Methods

     ========================== */
    _hideLabel() {
        this.parent.classList.add('typing');
    }

    _showLabel() {
        this.parent.classList.remove('typing');
    }


    /* ==========================

     Event Handlers

     ========================== */
    _inputClickHandler() {
        this.el.focus();
    }

    _inputTypingHandler() {

        if ( this.el.value.length > 0 ) {
            this._hideLabel();
        } else if ( !this.el.value.length ) {
            this._showLabel();
        }
    }


}

export default TextInput;
