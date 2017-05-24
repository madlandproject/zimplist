// Third party dependencies
import _ from "lodash";

// UZIK Depedencies
import BaseView from './BaseView';



/**
 *
 * A view that can contain others.
 * Automatically call resize/breakpoints on children and destroy them on destroy
 *
 */
class ContainerView extends BaseView {

    constructor(el, options) {

        super(el, options);
        this._subViews = [];

    }

    /* ==========================

     Public Methods

     ========================== */

    destroy() {

        // destroy and unregister all sub views
        this._subViews.forEach( view => {
            view.destroy();
            this._removeSubView(view);
        });

        // after this view is done, call super destroyer to do the real cleanup
        super.destroy();

    }


    resize() {
        this._subViews.forEach( (view) => view.resize() );
        super.resize();

    }


    /* ==========================

     Private Methods

     ========================== */

    /**
     * TODO rename to registerSubView
     *
     * @param view
     * @private
     */
    _addSubView( view ) {

        if ( !(view instanceof BaseView) ) {
            throw new Error('Attempting to add a sub-view to the container that does not inherit from BaseView');
        }

        // only one copy of each view
        if ( !_.includes(this._subViews, view) ) {
            this._subViews.push(view);
        }
    }

    /**
     *  TODO rename to unregisterSubView
     * @param view
     * @private
     */
    _removeSubView( view ) {
        let viewIndex = this._subViews.indexOf( view );

        if (viewIndex > -1) {
            this._subViews.splice(viewIndex,1);
        }
    }


    /* ==========================

     Event Handlers

     ========================== */
    _childClickHandler(event) {

    }


}

export default ContainerView;
