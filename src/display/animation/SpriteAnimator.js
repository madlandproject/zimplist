// UZIK Depedencies
import BaseView from '../BaseView';
import ImageLoader from '../../net/ImageLoader';

// Hidden consts

/**
 *
 *
 *
 */
class SpriteAnimator extends BaseView {

    constructor(el, options) {

        super(el, options);

        /**
         * Save rendering context reference
         * @type {CanvasRenderingContext2D}
         */
        this.drawingContext = this.el.getContext('2d');

        // HiDPI support
        this.drawingContext.scale( 1, 1);

        /**
         * Calc frame duration with FPS.
         * @type {number}
         */
        this.frameDuration = 1000 / options.fps;

        /**
         * Get total number of frames. We can't calc this automatically.
         * @type {number}
         */
        this.numFrames = options.numFrames;

        /**
         * Loop in point is the frame to loop from. If this value is -1, the sprite will not loop
         * @type {number}
         */
        this.loop = (options.loop === false) ? -1 : (options.loop || 0);

        this.width = this.el.width;
        this.height = this.el.height;

        this._currentFrame = 0;
        this.isPlaying = false;

        this.imageLoader = new ImageLoader( options.url );
        this.imageLoader.promise.then( (img) => {

            this.source = img.data;

            this.sourceCols = Math.floor( this.source.width / this.width);
            this.sourceRows = Math.floor( this.source.height / this.height);

            if (options.autoplay || this._playAfterLoad) {
                this.play();
            }
        });

    }

    /* ==========================

     Getters and setters

     ========================== */

    get currentFrames() {
        return this._currentFrame;
    }

    set currentFrame(value) {
        this._currentFrame = value - 1;
        this._render();
    }

    /* ==========================

     Public Methods

     ========================== */

    play() {
        if ( this.imageLoader.status !== 'complete' ) {
            this._playAfterLoad = true;
            return;
        }

        this.isPlaying = true;

        if ( !this.queuedFrame ) {
            this.queuedFrame = requestAnimationFrame( () => {
                if ( isNaN(this.lastRender) || Date.now() - this.lastRender > this.frameDuration) {
                    this._render();
                }

                this.queuedFrame = null; // empty ref
                if (this.isPlaying) this.play();
            });
        }
    }

    pause() {

        this.isPlaying = false;

        if (this.queuedFrame) {
            window.cancelAnimationFrame( this.queuedFrame );
            this.queuedFrame = null;
            this._playAfterLoad = false; // in case the sprite is played and paused before load
        }
    }

    destroy() {
        this.pause();
        super.destroy();
    }


    /* ==========================

     Private Methods

     ========================== */

    _render() {
        let frame = this._currentFrame + 1;

        if (frame >= this.numFrames - 1) {

            if (this.loop < 0) {
                this.pause();
                this._currentFrame = 0;
                return;
            } else {
                frame = this.loop;
            }

        }

        this.drawingContext.clearRect(0, 0, this.width, this.height);

        let x = Math.floor( frame % this.sourceCols);
        let y = Math.floor( frame / this.sourceCols );

        this.drawingContext.drawImage(
            this.source,
            x * this.width,
            y * this.height,
            this.width,
            this.height,
            0,0, this.width, this.height
        );

        this._currentFrame = frame;
        this.lastRender = Date.now();
    }


    /* ==========================

     Event Handlers

     ========================== */
    _childClickHandler() {

    }


}

export default SpriteAnimator;
