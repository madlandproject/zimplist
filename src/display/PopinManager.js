// Third party dependencies
import _ from "lodash";
import anime from "animejs";

// UZIK Depedencies
import BaseView from './BaseView';


class PopinManager extends BaseView {

    constructor(el, options) {

        super(el, options);

        // create a bound function to listen to changes. Stored as a property enable adding/removing it sequentially
        this._hashChangeHandler = _.bind(function(event){
            if (window.location.hash !== '#popin-open') {
                this.closePopin();
            }
        }, this);

        this.addDomEvent('click', this.popinContainerClickHandler, this.el);

    }

    /* ==========================

     Public Methods

     ========================== */

    /**
     * Get Popin's DOM to display in popin-container
     *
     * @param {Object} popinView - instance of Popin class
     */

    displayPopin(popinView) {

        if ( this.currentPopin ) {
            this.closePopin();
        }

        // Save reference to current popin
        this.currentPopin = popinView;
        popinView.manager = this;

        // add to popin-container if not already in page
        if ( !this.el.contains(popinView.el) ) {
            this.el.appendChild(popinView.el);
        }

        anime({
            targets : this.el,
            duration : 300,
            opacity : 1,
            easing : 'easeInOutQuart'
        });

        document.body.classList.add('popin-open');

        window.location.hash = 'popin-open';
        window.addEventListener('hashchange', this._hashChangeHandler);


    }

    /**
     * Remove Popin from popin-container and hide that
     *
     * @param {boolean} cleanDom - use to know is method can remove DOM or not
     */

    closePopin(cleanDom) {

        window.removeEventListener('hashchange', this._hashChangeHandler);

        // Real remove when anime is complete
        if (cleanDom == true) {
            document.body.classList.remove('popin-open');

            // remove element from container if it's a child
            if ( _.includes( this.el.children, this.currentPopin.el ) ) {
                this.el.removeChild( this.currentPopin.el );
            }

            window.location.hash = '';

            this.currentPopin.manager = null;
            this.currentPopin = null;
        }

        // Anime first then when its complete call closePopin with param 1 true
        if (cleanDom == undefined) {

            anime({
                targets : this.el,
                duration : 300,
                opacity : 0,
                easing : 'easeInOutQuart',
                complete : () => {this.closePopin(true)}
            });
        }



    }



    /* ==========================

     Private Methods

     ========================== */

    /* ==========================

     Event Handlers

     ========================== */


    popinContainerClickHandler() {
        if (event.target.classList.contains('popin-container')) {
            this.closePopin();
        }
    }


}

export default PopinManager;
