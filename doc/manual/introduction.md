Introduction
========

Zimplist aims to be the simplist framework for creating small front-end experiences.

## Core concepts ##
There are several core concepts to understand when working with Zimplist. They can be summarized as the following : **Modules**, **Classes**, **Events** and **Views**. Here is a brief explanation of each
    
### Modules ###
The framework is separated into ES6 modules. This standards-friendly organisation of code allows us to pick and choose what functionality is included in the final app. Modules are loosely grouped into folders according to functionality. More information about specific groups is available below.

### Classes ###
Zimplist uses ES6 classes to organise it's code, one class per module, per file. In some occasions singleton instances are exported by default from the module instead of the class.
 
### Events ###
Zimplist uses the pub/sub design pattern via events. This is the preferred method of communicating between objects in the framework. Event communication is used between parent and child views, on loaders, Input managers (touch, mouse, keyboard) and utilities like the WindowManager and ScrollingTracker.

These events should not be confused with DOM events that are bound in Views. See the Views section for more information on DOM events.

### Views ###
Views are what we use to organize the DOM. The most important class for this is the `BaseView`. This class handles the following functionality :

- Storing a reference to the view's element in the `this.el` property
- Responding to breakpoint changes.
- Adding, delegating and removing DOM events with built-in book keeping

## Modules ##
The modules in Zimplist are organized into the following top level directories :

- **core** : Important abstract classes, notably `EventTarget`
- **display** : Anything that appears on the screen, the most important class being `BaseView`. There are sub-directories for **animators** and simple **DOM** manipulation functions
- **geometry** : Abstract geometry classes
- **input** : User input management, Mouse, Touch and Keyboard
- **net** : Network related code like preloaders
- **utils** : Various utilities for specific functions like aspect ratio calculations, Scrolling Tracker

## Events ##
Events are implemented in the `EventTarget` class and most of the classes in Zimplist inherit from it. The class has `on`, `off` and `trigger` methods to listen and trigger events. It also has `listenTo` and `stopListening` methods to allow any object inheriting from EventTarget to listen to events on another EventTarget without having to handle it's own booking as would be the case with `on`. 

## Dependencies & Polyfills ##
Many utility functions from Lodash are used. For HTTP requests we use [XHR](https://www.npmjs.com/package/xhr) Those are the only dependencies. The following polyfills are used for continued Internet Explorer support.