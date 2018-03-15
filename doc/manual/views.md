Views
=====

The main class in Zimplist for organizing the DOM is `BaseView`. It includes a minimum of functionnality to simplify common tasks when working with the DOM.

Before describing BaseView's functionality, we need to understand it's intended place in the framework: By design, the DOM of sites using Zimplist are expected to be rendered by the server in their initial state. Each view is passed a DOM node in it's constructor which is stored on the `el` property. This is what we could call the "root node".

An application will query the DOM and instantiate views for the different page elements (for example we might have `Header`, `Footer`, `Page`, `Popin` views) Each of these views then sub-divides it's own part of the DOM to separate functionnality if necessary. This sub-division allows each view to be responsible for it's own DOM and allows us to organize communication in the view hierarchy via events and function calls making code easier to debug.

For example the `Header` view might create a `Menu` view and a `LanguageSelect` view from two sub-elements. We might want to collapse a sub-menu when the language select dropdown is opened. Instead of the `Menu` listening to DOM events on the language select DOM it is not responsible for, the `LanguageSelect` will dispatch an event of type `open` when it is opened. The `Header` View will be listening for this event and when received will call a public `collapseSubMenus()` function on the `Menu` view.

## Querying the DOM ##

`BaseView` includes the `find()` and `findAll` functions which are light proxies to `el.querySelector()` and `el.querySelectorAll()` cast as an Array.

## DOM Events ##

The biggest advtange of the `BaseView` Class is DOM event management. The most important aspects of this are automatic **book-keeping** and **delegation**. 

### Book-keeping ###
Book keeping means that when a DOM event is no longer needed it can be unbound easily, even if the listener was passed as an anonymous function.

If the developer uses the `remove()` or `destroy()` function. All events are automatically removed to avoid memory leaks.

### Delegation ###
Event delegation allows developers to listen to events on different DOM elements than those that trigger them. DOM Event objects natively have a `target` and `currentTarget` property. The `currentTarget` property is the element that has the event listener is attached to. Zimplist by default attaches events to `this.el` which will be the `currentTarget`.

Event delegation can be further controlled with the third `selector` parameter of the `addDomEvent` function. This parameter can be either of type `String` or `Element`. 

* When `selector` is an *element*, the event will be attached directly to this element instead of `this.el`. This is mostly useful when dealing with events that do not bubble.
* When `selector` is a *string*, the listener will only be triggered if the selector matches an element in the DOM hierarchy that the event bubbles through. This element, if found, is attached to the Event object as `delegateTarget`

For example: We want to detect a click on `.button` inside a view. We add a `click` DOM event without the third parameter. The event is attached to `this.el` so whenever the user clicks on any element in the view the event will trigger. This might not be a problem, we can check the event's `target` property and it might be the `.button` element. But what if that button contains an `img`tag? the `target` will the image and the `currentTarget` will be the root element.
If we add `.button` as the third parameter, when the user clicks on an element in the view, the framework will climb up the DOM to find if the selector matches our parameter

## Media queries ##

`BaseView` Helps developers work with responsive designs by calling a built-in function when a breakpoint changes.

When the user resizes the window and the breakpoint changes, the `breakpointChanged` function is called with two parameters : the new breakpoint and the previous breakpoint. These parameters are optional and are not declared on the dummy function to make overriding a bit lighter.


