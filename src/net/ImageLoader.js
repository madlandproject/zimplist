import _ from "lodash";

import Loader from "./Loader";

class ImageLoader extends Loader {

    constructor(url, srcset, sizes, options = {}) {

        // make sure it's paused so we can change paused status
        let paused = options.paused;

        super(url, _.defaults({paused: true}, options) );

        this.srcset = srcset;
        this.sizes = sizes;

        if ( !paused ) {
            this.load();
        }

    }

    /**
     * Override load mechanism
     */
    load() {

        let image = new Image();

        image.onload = () => {
            this.status = Loader.STATUS.LOADING;

            this._promiseResolve({url : this.url, data: image, rawData: image});
            this._handleLoadComplete();
        };

        image.onerror = () => {
            this._promiseReject('Could not load Image : ');
            this._handleLoadComplete();
        };

        // If already loaded call load handler manually
        if (image.complete === true) {
            setImmediate( () => image.onload() );
        }

        // Add properties to start the load
        if (this.srcset) image.srcset = this.srcset;
        if (this.sizes) image.sizes = this.sizes;
        image.src = this.url;

    }

}

export default ImageLoader;