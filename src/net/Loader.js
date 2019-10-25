// TODO remove xhr
import xhr from 'xhr';
// TODO remove lodash
import includes from 'lodash/includes';

// Zimple dependencies
import EventTarget from '../core/EventTarget';


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

    /**
     * Start the loading procedure and return the load Promise
     *
     * @returns {Promise|Promise<any>}
     */
    load() {

        // if a request is already in progress, return the promise
        if (this.request) {
            return this.promise;
        }

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

            } else if ( includes( [4, 5], statusCodeCategory ) ) {



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
                this.request = null;
                this._handleLoadComplete();
            }

        });

        this.status = Loader.STATUS.LOADING;

        return this.promise;

    }

    /**
     * Internal load event handler
     * @param event
     * @private
     */
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

    let returnObject;

    let ext = (forceType !== null) ? forceType : url.substr( url.lastIndexOf('.')+1 );

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



export {Loader as default};
