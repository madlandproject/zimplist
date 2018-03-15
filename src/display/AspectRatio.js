const AspectRatio = {

    FIT_MODE: {
        COVER: 'cover',
        CONTAIN: 'contain'
    },

    /**
     * Fits content to containers, either covering or containing them
     * @param content object describing a rectangle
     * @param container object describuing a rectangle
     * @param fitMode cover or contain content in container. refers to static properties of AspectRatio object
     */
    fitContent : function (content, container, fitMode = AspectRatio.FIT_MODE.COVER) {

        // calc ratios to decide how to do covering or containing
        const contentRatio = content.width / content.height;
        const containerRatio = container.width / container.height;

        let computedWidth;
        let computedHeight;

        // fit to width / height
        if ( (contentRatio < containerRatio && fitMode === AspectRatio.FIT_MODE.COVER) || (contentRatio > containerRatio && fitMode === AspectRatio.FIT_MODE.CONTAIN) ) {
            computedWidth   = container.width;
            computedHeight  = container.width / contentRatio;
        } else {
            computedWidth   = container.height * contentRatio;
            computedHeight  = container.height;
        }

        const computedY = (container.height - computedHeight) / 2;
        const computedX = (container.width - computedWidth) / 2;

        // return new rect with proper values
        return {
            y : computedY,
            x : computedX,
            width : computedWidth,
            height : computedHeight
        };

    }

};


export default AspectRatio;