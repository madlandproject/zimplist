// Third party dependencies
import _ from "lodash";
import anime from "animejs";

// Zimple Depedencies
import elIndex from "../display/dom/index";
import removeClasses from "../display/dom/removeClasses";
import Popin from './Popin';

class StepPopin extends Popin {

    constructor(el, options) {

        super(el, options);

        this.steps = Array.from( this.el.querySelectorAll('.popin-step') );

        let startIndex = Math.max( elIndex(this.steps, '.current'), 0); // avoid starting on -1, which won't work
        this.currentStepIndex = startIndex;

        this.changeItem(startIndex);

        this.addDomEvent('click', this._navButtonClickHandler, '.step-nav');

    }

    nextItem() {
        this.changeItem( this._getNextStepIndex( this.currentStepIndex) );
    }

    changeItem(stepIndex) {

        if (stepIndex !== this.currentStepIndex) {

            this.steps.forEach( (step) => removeClasses(step, 'current') );

            if ( _.isNumber(this.currentStepIndex) ) {

                this.steps[stepIndex].classList.add('current');
            }

            anime({
                targets : 'body',
                duration : 250,
                scrollTop : this.el.querySelector('.column.section-header').clientHeight,
                easing : 'easeInOutQuad'
            });

            this.currentStepIndex = stepIndex;
        }
    }


    _getPrevStepIndex(index) {
        return (index > 0) ? index - 1 : this.steps.length - 1;
    }

    _getNextStepIndex(index) {
        return (index < this.steps.length - 1)  ? index + 1 : 0;
    }


    /* Event Handler */

    _navButtonClickHandler(event) {
        event.preventDefault();

        let nextIndex = (event.delegateTarget.classList.contains('prev') ) ? this._getPrevStepIndex( this.currentStepIndex ) : this._getNextStepIndex( this.currentStepIndex );
        this.changeItem( nextIndex );

    }
}

export default StepPopin;