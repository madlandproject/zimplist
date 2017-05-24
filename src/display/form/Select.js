// Third party dependencies
import _ from "lodash";
import bowser from 'bowser';
import anime from "animejs";

// UZIK Depedencies


// Local app Dependencies
import BaseView          from '../BaseView';


// Hidden consts
var instances = [];

class Select extends BaseView {

    constructor(el, options) {

        let container = (el.tagName.toLowerCase() == 'select') ? el.parentElement : el;

        if ( el.classList.contains('custom-select') ) {
            console.warn('Custom select initantiated without container');
        }

        super(container, options);

        this.textSearchBuffer = '';

        this.nativeSelect   = this.el.querySelector('select');
        this.label          = this.el.querySelector('.custom-select-label');


        if (bowser.mobile || bowser.tablet) {
            this.el.classList.add('mobile-device');
        } else {
            this.hasCustomOptionsList = true;
        }

        if (this.hasCustomOptionsList) {
            this._createCustomOptionsList();
        }

        instances.push(this);



        this.render();

        this.addDomEvent('change', this.render, this.nativeSelect );
        this.addDomEvent('click', this._toggleCustomOptions, this.label);
        this.addDomEvent('click', this._customOptionsClickHandler, '.options li');
        this.addDomEvent('click', this._bodyClickHandler, document.body);

    }

    /* ==========================

     Public Methods

     ========================== */

    render() {
        this.label.innerHTML = this.nativeSelect.options[this.nativeSelect.selectedIndex].text;
    }

    setSelectedOption(selectedIndex) {

        let oldOption = this.nativeSelect.selectedIndex;

        this.nativeSelect.selectedIndex = selectedIndex;
        this.nativeSelect.options[ selectedIndex ].setAttribute('selected', 'selected');
        this.nativeSelect.options[ oldOption ].removeAttribute('selected');

        this.customOptions[ selectedIndex ].setAttribute('selected', 'selected');
        this.customOptions[ oldOption ].removeAttribute('selected');

        this.render();
    }

    breakpointChanged(breakpoint, previousBreakpoint) {

    }

    /* ==========================

     Private Methods

     ========================== */

    _createCustomOptionsList() {

        this.customOptionsList = document.createElement('ul');
        this.customOptionsList.setAttribute('class', 'options');


        this.customOptions = _.map(this.el.querySelectorAll('option'), (option) => {
            let customOption = document.createElement('li');

            // text and value
            customOption.setAttribute('data-value', option.value);
            customOption.innerHTML = option.innerHTML;

            // Other value
            if (option.disabled) {
                customOption.setAttribute('disabled', 'disabled');
            }

            if (option.selected) {
                customOption.setAttribute('selected', 'selected');
            }

            this.customOptionsList.appendChild( customOption );

            return customOption;
        });


        // hide and add to DOM
        this._hideCustomOptions();
        this.el.appendChild ( this.customOptionsList );
    }

    _toggleCustomOptions() {
        if ( this.el.classList.contains('options-list-visible') ) {
            this._hideCustomOptions();
        } else {
            this._showCustomOptions();
        }
    }

    _showCustomOptions() {
        this.el.classList.add('options-list-visible');

        _.invokeMap( _.without( instances, this ), '_hideCustomOptions' );

        this.addDomEvent('keypress', this._bindCursorEvent, document.body);

    }

    _hideCustomOptions() {
        this.el.classList.remove('options-list-visible');
        this.removeDomEvent('keypress', document.body);
    }


    _resetSearchBuffer() {
        let that = this;
        if( _.isNumber(this.textSearchTimeout) ) {
            window.clearTimeout(this.textSearchTimeout);
        }

        this.textSearchTimeout = window.setTimeout( function () {
            that.textSearchBuffer = '';
        }, 1000);
    }

    _searchOptions(optionText) {
        let foundOption = _.find( this.customOptions, function (option) {
            return (option.innerHTML.substr(0, optionText.length).toLowerCase() == optionText.toLowerCase() );
        });

        if (foundOption) {
            this._setCursor( this.customOptions.indexOf( foundOption ) );
        }
    }


    _setCursor(index) {
        this.cursorIndex = index;

        let cursorOption = this.customOptions[index];

        _.forEach( this.customOptions, function (option) {
            if ( option === cursorOption ) {
                option.classList.add('cursor');
            } else {
                option.classList.remove('cursor');
            }
        });

        // TODO remove this to a sub class, no animejs in UZIK
        let scrollTo = anime({
            targets : this.customOptionsList,
            duration : 300,
            scrollTop : cursorOption.offsetTop,
            easing : 'easeInOutQuad'
        })
    }


    /* ==========================

     Event Handlers

     ========================== */
    _customOptionsClickHandler(event) {
        // prevent selection of disabled options

        if ( !event.delegateTarget.hasAttribute('disabled') ) {
            this.setSelectedOption( this.customOptions.indexOf( event.delegateTarget ) );
            this._hideCustomOptions();
        }
    }

    _bodyClickHandler(event) {
        if ( !(this.el.contains(event.target) && this.el !== event.target) ) {
            this._hideCustomOptions();
        }
    }

    _bindCursorEvent() {

        if (event.keyCode == 13) {
            this.setSelectedOption( this.cursorIndex );
            this._hideCustomOptions();
        } else {
            this.textSearchBuffer += String.fromCharCode( event.which );
            this._searchOptions( this.textSearchBuffer );
            this._resetSearchBuffer();
        }
    }


}

export default Select;
