// Third party dependencies
import _ from "lodash";

// Zimple Depedencies
import BaseView from './BaseView';


class Popin extends BaseView {

    constructor(el, options) {

        super(el, options);


        this.addDomEvent('click', this._closeClickHandler, '.close-popin');
    }

    /* ==========================

     Public Methods

     ========================== */


    /* ==========================

     Private Methods

     ========================== */



    /* ==========================

     Event Handlers

     ========================== */

    _closeClickHandler() {
        this.manager.closePopin();
    }
}

export default Popin;
