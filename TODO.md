## Workflow ##
- Unit tests
- Other developer participation in ongoing projects. There are several strategies available :
    * clone repo elsewhere and npm link to the project. Modifications via pull request (lol)
    * git submodules
    * git subtree
    * include all JS in project git, only main dev symlinks his SRC folder to the project, or moves changes manually.



## New classes ##
- TemplateView
- RenderLoop (detect frame rate)

## Documentation ##
- Write annotations
- Write manual
    * BaseView and ContainerView
    * Describe each top-level package and important sub packages
- Explicit choices about singletons and class inheritance.
- Use of Modernizr?

## Reorganization ##
- Decide on singleton approach (do we even need one? should apps decide this?)
- Decide on naming for protected methods

## Polyfills ##
- List Polyfills

## View Class ##
- Transition functions

## Form management ##
- basic control class.
- CustomSelect, with cursor, scrolling pane
- States : touched, dirty, invalid, changed,
- Validators (taking into account possible advances in the HTML5 spec)
- asyncSubmit with events


## Touch ##
- refactor gesture detection

## Config ##
- Sub classing might be better solution per project
- Access through `registry` or `properties`
