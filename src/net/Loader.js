// Third party dependencies
import _        from "lodash";
import xhr      from "xhr";

// UZIK dependencies
import EventTarget from "../core/EventTarget";


let loaderID = 0;

class Loader extends EventTarget {

    constructor(url, options = {paused : false, parseBody : true}) {
        super();

        this.url = url;
        this.id = options.id || 'loader-'+loaderID++;

        this.options = options;

        // Load progress, at construct, it is always 0
        this.progress = 0;

        // Create Promise for this loader, and save the resolve and reject functions for later
        this.promise = new Promise( (resolve, reject) => {
            this._promiseResolve = resolve;
            this._promiseReject = reject;
        });

        // Start or pause loading
        if ( this.options.paused ) {
            this.status = Loader.STATUS.PAUSED;
        } else {
            this.load();
        }

    }

    load() {

        // detect type of load
        this.request = xhr({
            url : this.url,
            beforeSend : (nativeXHR) => {
                // attach progress event. you never know
                nativeXHR.addEventListener('progress', (event) => {
                    this._handleLoadProgress(event); // force context to instance of preloader
                });
            }
        }, (err, response, body) => {

            let statusCodeCategory = parseInt( response.statusCode.toString()[0] );

            if (err) {

                this._promiseReject(new Error(response.text));
                this._handleLoadComplete();

            } else if ( _.includes( [4, 5], statusCodeCategory ) ) {



            } else {

                // always save a copy of the raw data
                this.rawData = body;

                // might want to parse the body
                if (this.options.parseBody) {

                    // in case there isn't an extension, resort to content-type sniffing and forcing the type
                    if ( this.url.lastIndexOf('.') < this.url.lastIndexOf('/')) {
                        let contentType = response.headers['content-type'];
                        let type;
                        if ( contentType.toLowerCase().includes('application/json') ) {
                            type = 'json';
                        }

                        this.data = Loader.parseResponseBody( this.url, body, type);
                    } else {
                        this.data = Loader.parseResponseBody( this.url, body );
                    }

                } else {
                    this.data = body;
                }

                this._promiseResolve({url : this.url, data: this.data, rawData: body});
                this._handleLoadComplete();
            }

        });

        this.status = Loader.STATUS.LOADING;

        return this.promise;

    }

    _handleLoadProgress(event) {
        if (event.lengthComputable) {
            this.progress = event.loaded / event.total;
            this.trigger('progress', {progress : this.progress});
        }
    }

    /**
     * Handle end of loading. including changing loader status and firing events
     * @protected
     */
    _handleLoadComplete() {

        this.status = Loader.STATUS.COMPLETE;
        this.progress = 1;
        this.trigger('complete', {target: this});

    }

}






/**
 * Helper to return a more usable object from the preloader. Simple detection based on file extension
 *
 * @param url the loaded file's URL
 * @param body th loaded file's content
 * @param forceType sometimes we need to force parsing of a certain type regardless of it's file name
 */
Loader.parseResponseBody = function (url, body, forceType = null) {

    var returnObject;

    var ext = (forceType !== null) ? forceType : url.substr( url.lastIndexOf('.')+1 );

    switch (ext) {
        case 'js' :
            returnObject = document.createElement('script');
            returnObject.textContent = body;
            break;
        case 'json' :
            returnObject = JSON.parse( body );
            break;
        case 'svg' :
            let tempDiv = document.createElement('div');
            tempDiv.innerHTML = body;
            returnObject = tempDiv.firstChild;
            break;
        default : // pass through
            returnObject = body;
    }

    return returnObject;

};

Loader.STATUS = {
    PAUSED      : 'paused',
    LOADING     : 'loading',
    COMPLETE    : 'complete'
};



/**
 *
 * PreloaderQueue
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

        if (this.loaders.length == 0) {
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
        var totalLoaders = this.loaders.length;

        var completeLoaders = 0;
        var currentLoaders = 0;
        var currentProgress = 0;

        // Count complete and current loaders, total their progress
        this.loaders.forEach( loader => {

            if (loader.status == Loader.STATUS.COMPLETE) {
                completeLoaders++;
            } else if (loader.status == Loader.STATUS.LOADING) {
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
                this.loaders.filter( loader => loader.status == Loader.STATUS.PAUSED ).slice(0, LoaderQueue.MAX_CONCURRENT - currentLoaders).forEach(loader => loader.load() );

            }

        }


    }

}

LoaderQueue.MAX_CONCURRENT = 5;

export {Loader as default, LoaderQueue};