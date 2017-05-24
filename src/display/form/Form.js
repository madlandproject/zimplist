import xhr from "xhr";

import ContainerView from '../ContainerView';
import TextInput from './TextInput';
import Select from './Select';

// full syntax is #PREFILL_KEY:inputname=inputvalue&inputname2=inputvalue2
const PREFILL_KEY = 'form-prefill';

const triggerFormEvent = function (input, type) {

    let event = document.createEvent('Event');
    event.initEvent(type, true, false);
    input.dispatchEvent( event );

};

class Form extends ContainerView {

    constructor(el, options) {

        super(el, options);

        // Create inputs
        this.inputs = Array.from( this.el.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"], select, textarea') ).map( (input) => {

            let inputComponent;

            // check tag name and create sub views / components
            switch ( input.tagName.toLowerCase() ) {
                case 'textarea':
                case 'input':
                    inputComponent = new TextInput( input );
                    break;
                case 'select':
                    inputComponent = new Select( input );
                    break;
            }

            if (inputComponent) {
                this._registerSubView( inputComponent );
            }

            return inputComponent;

        });

        this._prefillForm();

    }


    _prefillForm() {

        // Prefill inputs with value specified in hash part of URL
        let hash = window.location.hash;

        // match to a particular key
        if ( hash.substr(1, PREFILL_KEY.length) == PREFILL_KEY ) {

            // get values
            let prefillValues = hash.split(':')[1].split('&');

            prefillValues.forEach( (prefilled) => {

                let [inputName, inputValue] = prefilled.split('=');

                let input = this.el.elements[inputName];

                switch ( input.tagName.toLowerCase() ) {
                    case 'textarea':
                    case 'input':
                        input.value = inputValue;
                        triggerFormEvent(input, 'input');
                        break;
                    case 'select':
                        input.selectedIndex = inputValue;
                        triggerFormEvent(input, 'change');
                        break;
                }


            });


        }

    }

    /**
     *
     * TODO rename this
     */
    AJAXMethod() {
        let that = this;
        let formData = new FormData(this.el);
        let action  = this.el.action;
        let method  = this.el.method;

        xhr({
            body: formData,
            uri: action,
            method: method
        }, function (err, resp, body) {

            that.trigger('response', resp);


        });

    }

}

export default Form;