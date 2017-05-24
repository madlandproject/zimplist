Zimple
======
>Keep it zimple.

### What it is ### 
Zimple is A simple framework for building front ends for websites. Zimple is intended for use in dynamic content-heavy, search-engine friendly websites that mostly serve up HTML. This does not exclude the idea of server-side rendering or client-side templates, it just isn't expected by default.

### What it is not ###
Zimple is not in the same game as Angular, Ember, React, Vue or the myriad of opinionated front-end frameworks. The aim isn't to enable building single page, JS heavy applications as fast as possible. It would certainly help, but may not be the best tool in the box. There is no change watch, scaffolding tool or CLI. No custom template syntax, no preferred JS variant language. 

## Classes & Modules ##
Functionality is separated into ES2015 modules. These include functions, classes and objects organized loosely into folders. Yes ES2015 classes are syntactic sugar and obfuscate the true nature of prototypal inheritance, but it's a coding paradigm many people find useful. 

## Documentation ##
API and use manual is generated via ESDOC (link) and is available in docs/exported

## Polyfills ##
You may need the following polyfills depending on the browser support you are aiming for

- Element.classList
- Element.matches
- requestAnimationFrame
- Promise
