import EventTarget from '../core/EventTarget';

import _ from 'lodash';

const DEFAULTS = {
    method : 'GET',
    body : null
};

/**
 * the HTTP provides a Promise and EventTarget friendly wrapper
 */
class HTTP extends EventTarget {


    /**
     *
     * @param {string} url - The URL to request
     * @param {Object} options - Options to set on the request including method and additional headers
     */
    constructor(url, options) {
        super();

        /**
         * @type {string}
         */
        this.url = url;

        this.options = _.defaults( options, DEFAULTS );

        // create promise for later consumption
        /**
         * @type {Promise} Promise that resolves or rejects according to the request state
         */
        this.promise = new Promise( (resolve, reject) => {
            this._requestPromiseResolver = resolve;
            this._requestPromiseRejector = reject;
        });

        this._buildRequest();
    }

    /**
     *
     * @private
     */
    _buildRequest() {

        this._request = new XMLHttpRequest();

        this._request.addEventListener('progress', this._requestProgressHandler);
        this._request.addEventListener('abort', this._requestAbortHandler);
        this._request.addEventListener('error', this._requestErrorHandler);
        this._request.addEventListener('load', this._requestLoadHandler);

        this._request.open( this.options.method, this.url );

        // TODO set headers

        this._request.send( this.options.body );
    }

    /*

    Event handlers

     */

    _requestProgressHandler(event) {
        this.trigger('progress', event);
    }

    _requestAbortHandler(event) {
        this.trigger('abort', event);
    }

    _requestErrorHandler(event) {
        this.trigger('error', event);
    }

    _requestLoadHandler(event) {

        console.log(event);
        // TODO analyse request for ready state and append data to event.



        this.trigger('load', event);

        this._requestPromiseResolver();
    }

}

/*

 Static shortcut functions that return promises

*/

/**
 * @static
 * @param url
 * @returns {Promise}
 */
HTTP.get = function(url) {
    return new HTTP(url, {method: 'GET'}).promise;
};


/**
 *
 * @static
 * @param url
 * @param body
 * @returns {Promise}
 */
HTTP.post = function (url, body) {
    return new HTTP(url, {method: 'POST', body: body}).promise;
};


/**
 *
 * @static
 * @param url
 * @param body
 * @returns {Promise}
 */
HTTP.put = function (url, body) {
    return new HTTP(url, {method: 'PUT', body: body}).promise;
};


/**
 *
 * @static
 * @param url
 * @param body
 * @returns {Promise}
 */
HTTP.delete = function (url, body) {
    return new HTTP(url, {method: 'DELETE', body: body}).promise;
};



export default HTTP;