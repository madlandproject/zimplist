import defaults from '../utils/defaults';
import { isArray, isElement } from '../utils/typeUtils';


/**
 A class to split up lines, words and characters into divs and spans.

 First it will parse the element's content and store it in nested arrays (see below). It will then empty the div and replace it with divs and spans

 The internal representation of the split text :
 ```
 [
 [
 'l',
 'i',
 'n',
 'e'
 ],
 <br />,
 [
 'w',
 'o',
 'r',
 'd'
 ],
 [
 'w',
 'o',
 'r',
 'd'
 ]
 ]
 ```

 */
class SplitText {

    /**
     * @param {Element} el - Element who's content will be split
     * @param {Object} options - Options for splitting the text
     */
    constructor(el, options = {}) {

        this.el = el;

        defaults(options, SplitText.defaultOptions);

        // Save filter functions

        /**
         * When the output is being built, pass every word element through this function
         * @type {function(word: Element): Element}
         */
        this.wordFilter = options.wordFilter;

        /**
         * When the output is being built, pass every char element through this function
         * @type {function(char: Element): Element}
         */
        this.charFilter = options.charFilter;

        /**
         * The CSS class to add to line elements
         * @type {string}
         */
        this.lineClass = options.lineClass;

        /**
         * The CSS class to add to word elements
         * @type {string}
         */
        this.wordClass = options.wordClass;

        /**
         * The CSS class to add to char elements
         * @type {string}
         */
        this.charClass = options.charClass;

        /**
         * Save a string representation of the element's original content
         * @type {string}
         * @private
         */
        this._originalHTML = this.el.innerHTML;

        /**
         * Parsed nodes of the content
         * @type {Array}
         * @private
         */
        this._parsedNodes = this._parseNodeContent(this.el);

        // Add class to the element.
        this.el.classList.add('split-text');

        // Change content to rendererd string.
        this.el.innerHTML = this._renderString();

    }


    /**
     * Remove elements generated by text splitting process and re-inject original contents
     */
    reset() {
        this.el.innerHTML = this._originalHTML;
        this.el.classList.remove('split-text');
    }

    /**
     * Return the composed HTML of split text
     * @returns {String}
     * @private
     */
    _renderString() {

        let render = this._parsedNodes.reduce((rendered, currentItem) => {
            let nodeHTML;
            if (isArray(currentItem)) { // if it's an array, then create word from it
                nodeHTML = this._createWord(currentItem).outerHTML + ' '; // MUST include a space after the word or all the words will be treated as one long word
            } else if (isElement(currentItem)) {

                if (currentItem.tagName.toLowerCase() === 'br') { // If it's a BR, start a new line but do not copy BR
                    nodeHTML = `</div><div class="${this.lineClass}">`;
                } else {
                    nodeHTML = currentItem.outerHTML; // otherwise copy HTML straight to rendered content
                }

            }
            return rendered + nodeHTML;
        }, `<div class="${this.lineClass}">`); // start reduce with a new .line element

        // Close line
        render += '</div>';

        return render;

    }

    /**
     * Create an element for the character. passing through an optional filter and adding a CSS class name
     *
     * @param {String} content - Single char to create an element for
     * @returns {Element} element representing a single character
     * @private
     */
    _createChar(content) {
        let char = document.createElement('span');
        char.className = this.charClass;
        char.textContent = content;
        return this.charFilter(char);
    }

    /**
     * Returns a span containing multiple characters, passed to the createChar function.
     *
     * @param {Array} charArray - Array of characters
     * @returns {Element} an element containing multiple char elements
     * @private
     */
    _createWord(charArray) {
        let word = document.createElement('span');
        word.className = this.wordClass;
        // set the whole HTML of the word by mapping each char to a div, and reducting them to a string;
        word.innerHTML = charArray.map((char) => this._createChar(char)).reduce((fullWord, char) => fullWord + char.outerHTML, '');
        return this.wordFilter(word);
    }

    /**
     * Loop over element returning an array of elements and words. Each word is an array of chars.
     *
     * @param {Element} el - The element to parse
     * @returns {Array} An array of chars or nested words
     * @todo handle recursion
     */
    _parseNodeContent(el) {
        let children = el.childNodes;
        let parsedNodes = [];

        for (let i = 0; i < children.length; i++) {
            let node = children[i];

            if (node.nodeType == 1) { // node is Element

                parsedNodes.push(node); // TODO handle recursion if node has child nodes

            } else if (node.nodeType == 3) { // node is text node

                // trim off excess white space
                let nodeValue = node.nodeValue.trim();

                // don't parse empty nodes
                if (nodeValue.length > 0) {
                    // split a text node into specific words
                    let words = nodeValue.split(/\s/);

                    // for each word, add an array of it's character
                    words.forEach((word) => {
                        parsedNodes.push(word.split(''));
                    });
                }
            }
        }

        return parsedNodes;
    }

}

/**
 * @static
 * @type {{wordFilter: function, charFilter: function, lineClass: string, wordClass: string, charClass: string}}
 */
SplitText.defaultOptions = {
    wordFilter: (word) => word,
    charFilter: (char) => char,
    lineClass: 'line',
    wordClass: 'word',
    charClass: 'char'
};


export default SplitText;
