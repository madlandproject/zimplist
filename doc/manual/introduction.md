Introduction to Zimplist
========================

Zimplist aims to be the simplist framework for creating small front-end experiences.

## Core concepts ##
There are several core concepts to understand when working with Zimplist. They can be summarized as the following : **Modules**, **Classes**, **Events** and **Views**. Here is a brief explanation of each
    
### Modules ###
The framework is separated into ES6 modules. This standards-friendly organisation of code allows us to pick and choose what functionality is included in the final app. Modules are loosely grouped into folders according to functionality. More information about specific groups is available below.

### Classes ###
Zimplist uses ES6 classes to organise it's code, one class per module, per file. I am going to completely bypass the "classes-in-javascript-is-bad" debate. The advantages of clear inheritence outweigh the inconveniances. In some occasions singleton instances are exported by default from the module instead of the class.
 
### Events ###
Zimplist uses the pub/sub design pattern via events. This is the preferred method of communicating between objects in the framework. Event communication is used between parent and child views, on loaders, Input managers (touch, mouse, keyboard) and utilities like the WindowManager and ScrollingTracker.


These events should not be confused with DOM events that are bound in Views. See the Views section for details on these.

### Views ###
Views are what we use to organize the DOM. The most important class for this is the `BaseView`. This class handles the following functionality :

- Storing a reference to the view's element in the `this.el` property
- Responding to breakpoint changes.
- Adding, delegating and removing DOM events with built-in book keeping


## Events ##
Events are implemented in the EventTarget class and most of the classes in Zimplist inherit from it. The class has `on`, `off` and `trigger` methods to listen and trigger events. It also has `listenTo` and `stopListening` methods to allow any object inheriting from EventTarget to listen to events on another EventTarget without having to handle the removal of these events on the target. 

## Views ##

The main class that anything that touches the DOM inherits from is `BaseView`. It includeds a minimum of functionnality to simplify common tasks. 

Before describing BaseView's functionnality, a short description on it's intended place: By design, the DOM of sites using Zimplist are expected to be rendered by the server in their initial state. Each view is passed a DOM node in it's constructor which is stored on the `el` property. The application then queries the DOM and instantiates views for the differen't page elements (for example we might have `Header`, `Footer`, `Page`, `Popin` views) Each of these views then sub-divides it's own DOM to separate functionnality if necessary. This sub-division allows each view to be responsible for it's own DOM and organize communication between view hierarchy to events and function calls making code easier to debug.

For example the `Header` view might create a `Menu` view and a `LanguageSelect` view from two sub-elements. We might want to collapse a sub-menu when the language select dropdown is opened. Instead of the `Menu` listening to DOM events on the language select DOM it is not responsible for, the `LanguageSelect` will dispatch an event of type `open` when it is opened. The `Header` View will be listening for this event and when received will call a public `collapseSubMenus()` function on the `Menu` view.


## Dependencies ##
A quick word on dependencies. The only hard dependency is Lodash. That's it.