import defaults from 'lodash/defaults';

import Loader from './Loader';

/**
 * Load images via an <img /> tag
 */
class ImageLoader extends Loader {

    constructor(url, srcset, sizes, options = {}) {

        // make sure it's paused so we can change paused status
        let paused = options.paused;

        super(url, defaults({paused: true}, options) );

        this.srcset = srcset;
        this.sizes = sizes;

        if ( !paused ) {
            this.load();
        }

    }

    /**
     * Image load mechanism
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
        if (image.complete === true && image.width && image.height) {
            setTimeout( () => image.onload(), 0);
        }

        // Add properties to start the load
        if (this.srcset) image.srcset = this.srcset;
        if (this.sizes) image.sizes = this.sizes;
        image.src = this.url;

        return this.promise;

    }

}

export default ImageLoader;