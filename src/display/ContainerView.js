// Third party dependencies
// TODO remove lodash
import includes from 'lodash/includes';

// Zimple Depedencies
import BaseView from './BaseView';

// TODO make Mixin
/**
 * A view that can contain other views.
 * Automatically call resize/breakpointChanged/destroy on children.
 */
class ContainerView extends BaseView {

    /**
     * See super declaration. This view also instantiates a subview array
     * @param el
     * @param options
     */
    constructor(el, options) {

        super(el, options);

        /**
         * An array of contained sub views
         * @type {Array}
         * @private
         */
        this._subViews = [];

    }

    /* ==========================

     Public Methods

     ========================== */

    /**
     * Destroy
     */
    destroy() {

        // destroy and unregister all sub views
        this._subViews.forEach( view => {
            view.destroy();
            this._unregisterSubView(view);
        });

        // after this view is done, call super destroyer to do the real cleanup
        super.destroy();

    }

    /**
     * Call resize for all the sub-views
     */
    resize() {
        this._subViews.forEach( (view) => view.resize() );
        super.resize();

    }


    /* ==========================

     Private Methods

     ========================== */

    /**
     *
     * @param {BaseView} view - the sub-view to register with this as a parent
     * @private
     */
    _registerSubView(view ) {

        if ( !(view instanceof BaseView) ) {
            throw new Error('Attempting to add a sub-view to the container that does not inherit from BaseView');
        }

        // only one copy of each view
        if ( !includes(this._subViews, view) ) {
            this._subViews.push(view);
        }

        if ( !this.el.contains( view.el ) ) {
            console.warn('Adding sub-view who\'s DOM element isn\'t contained in this.el')
        }
    }

    /**
     *  Remove sub-view from internal array
     * @param view
     * @private
     */
    _unregisterSubView(view ) {
        let viewIndex = this._subViews.indexOf( view );

        if (viewIndex > -1) {
            this._subViews.splice(viewIndex,1);
        }
    }

}

export default ContainerView;
