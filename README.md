Zimplist
======
>Keep it Zimplist.

### What it is ### 
Zimplist is A simple framework for building front ends for websites. Zimplist is intended for use in dynamic content-heavy, that mostly get their HTML from the server. This does not exclude the idea of server-side rendering or client-side templates, it just isn't expected by default.

### What it is not ###
Zimplist is not in the same game as Angular, Ember, React, Vue or the myriad of opinionated behemoth front-end frameworks. The aim isn't to enable building single page, JS heavy applications as fast as possible. It would certainly help, but may not be the best tool in the job. There is no change watch, scaffolding tool or CLI. No templating, no preferred JS variant language. Nada. 

## Classes & Modules ##
Functionality is separated into ES2015 modules. These include functions, classes and objects organized loosely into folders. Yes ES2015 classes are syntactic sugar and obfuscate the true nature of prototypal inheritance, but it's a coding paradigm many people find useful. 

## Documentation ##
API and use manual is generated via [ESDOC](https://esdoc.org) and is available in docs/generated

## Polyfills ##
You may need the following polyfills depending on the browser support you are aiming for

- Element.classList
- Element.matches
- requestAnimationFrame
- Promise
