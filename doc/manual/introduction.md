Introduction to Zimplist
############

## Core concepts ##
There are several core concepts to understand when working with Zimplist :

    - Modules
    - Classes
    - Events
    - Views
    
### Modules ###
The framework is separated into ES6 modules. This standards-friendly organisation of code allows us to pick and choose what functionality is included in the final app. There are many dependencies between modules but only when necessary.
Modules are organized into folders to group functionality, loosely inspired by the ActionScript 3 packages hierarcy of yore.

### Classes ###
Zimplist uses ES6 classes to organise it's code, one class per module. I am going to completely bypass the "classes-in-javascript-is-bad" debate. The advantages of clear inheritence outweigh the inconveniances.
 
### Events ###
Zimplist uses the pub/sub design pattern via events (largely inspired by the events Backbone.js). This is the preferred method of communicating between classes in the framework. If we have, for example, a Page view and a Section view and we want the section to inform the page a link has been clicked, this should be triggered by a custom event 

Events take the form of the EventTarget class and most of the classes in Zimplist inherit from it. The class has `on`, `off` and `trigger` methods to listen and trigger events. It also has `listenTo` and `stopListening` methods to allow any object inheriting from EventTarget to listen to events on another EventTarget without having to handle the removal of these events on the target. 

### Views ###
Views are what we use to cut up the DOM. 


## Dependencies ##
A quick word on dependencies. The only hard dependency is Lodash. That's it.