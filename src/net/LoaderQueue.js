import EventTarget from '../core/EventTarget';
import Loader from './Loader';

/**
 *
 * LoaderQueue
 *
 * Simple Event & Promise based queue mechanism for loading multiple preloaders
 *
 */
class LoaderQueue extends EventTarget {

    constructor(urls = []) {
        super();

        // create an array of prelaoders for each url
        this.loaders = [];

        urls.forEach( (url) => {
            this.add( url );
        });

        // Create promise and save it's callbacks to this instance for later access
        this.promise = new Promise( (resolve, reject) => {
            this._promiseResolve = resolve;
            this._promiseReject = reject;
        });

        // For convenience, force trigger a progress event when there are no loads complete
        // use setImmediate (probably with polyfill) to force triggering on next event loop (otherwise no listeners will have time to be added)
        // TODO remove, setImmediate isn't a spec
        setImmediate( () => this._preloaderCompleteHandler() );

    }

    add(preloaderOrUrl) {

        // determine if we should pause the loader based on how many are currently loading
        let shouldPause = this.loaders.reduce( (total, loader) => { return total + (loader.status == Loader.STATUS.LOADING ? 1 : 0)}, 0) >= LoaderQueue.MAX_CONCURRENT;

        // create preloader
        let preloader = ( _.isString(preloaderOrUrl) ) ? new Loader(preloaderOrUrl, {paused: shouldPause} ) : preloaderOrUrl;

        // Attach events
        preloader.on('complete', this._preloaderCompleteHandler, this);
        preloader.on('progress', this._preloaderProgressHandler, this);

        this.loaders.push( preloader );

        return preloader;
    }

    get progress() {

        if (this.loaders.length === 0) {
            return -1;
        } else {
            let totalProgress = this.loaders.reduce( (total, loader) => {return total + loader.progress}, 0);
            return totalProgress / this.loaders.length;
        }

    }

    _preloaderProgressHandler(event) {
        this.trigger('progress', {progress : this.progress});
    }

    _preloaderCompleteHandler() {

        // get number of complete loaders and total loaders in queue
        let totalLoaders = this.loaders.length;
        let completeLoaders = 0;
        let currentLoaders = 0;

        // Count complete and current loaders, total their progress
        this.loaders.forEach( loader => {

            if (loader.status === Loader.STATUS.COMPLETE) {
                completeLoaders++;
            } else if (loader.status === Loader.STATUS.LOADING) {
                currentLoaders++;
            }

        });

        // Trigger events for progress and completion
        if (completeLoaders === totalLoaders) {
            this._promiseResolve(this.loaders);
            this.trigger('complete'); // TODO return loaders? data?
        } else {
            this.trigger('progress', {progress: this.progress});

            // if there are less current loaders than MAX_CONCURRENT, unpause them
            if (currentLoaders < LoaderQueue.MAX_CONCURRENT) {

                /*
                 Big one liner to unpause queued loaders :
                 - filters for paused loaders
                 - takes as many as possible, below MAX_CONCURRENT threshold
                 - starts load() on each Preloader instance
                 */
                this.loaders.filter( loader => loader.status === Loader.STATUS.PAUSED ).slice(0, LoaderQueue.MAX_CONCURRENT - currentLoaders).forEach(loader => loader.load() );

            }

        }


    }

}

LoaderQueue.MAX_CONCURRENT = 5;
