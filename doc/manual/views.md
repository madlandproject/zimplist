Views
=====

The main class for orangizing the DOM is `BaseView`. It includeds a minimum of functionnality to simplify common tasks.

Before describing BaseView's functionality, we need short description on it's intended place in the framework: By design, the DOM of sites using Zimplist are expected to be rendered by the server in their initial state. Each view is passed a DOM node in it's constructor which is stored on the `el` property. This is what we could call the "root node". In the aim cleanly separating code.

 The application then queries the DOM and instantiates views for the differen't page elements (for example we might have `Header`, `Footer`, `Page`, `Popin` views) Each of these views then sub-divides it's own DOM to separate functionnality if necessary. This sub-division allows each view to be responsible for it's own DOM and organize communication between view hierarchy to events and function calls making code easier to debug.

For example the `Header` view might create a `Menu` view and a `LanguageSelect` view from two sub-elements. We might want to collapse a sub-menu when the language select dropdown is opened. Instead of the `Menu` listening to DOM events on the language select DOM it is not responsible for, the `LanguageSelect` will dispatch an event of type `open` when it is opened. The `Header` View will be listening for this event and when received will call a public `collapseSubMenus()` function on the `Menu` view.