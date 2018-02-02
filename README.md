#dom-tool.js

[![NPM version](https://img.shields.io/npm/v/dom-tool.svg)]()
[![npm](https://img.shields.io/npm/dt/dom-tool.svg)]()
[![Travis](https://img.shields.io/travis/khrome/dom-tool.svg)]()

DomTool is a dom manipulation library for traversing and selecting nodes out of the DOM, it's simple to use, requires no selector libraries and works on all node types (not just elements and attrs). I use it for 2nd pass parsing of template output for dynamic binding, but it can be used for a wide variety of applications. **Does not make comment tags mysteriously disappear from the document.**

##Installation

Install the library from your command line:

    npm install dom-tool

##Usage
Essentially you register listeners then perform a traversal, which is intended to mutate the DOM (though this is not strictly necessary).

Then import into your script

    var DomTool = require('dom-tool');

### DomTool.lookFor(criteria, handler)
This registers a handler for a certain node type, it currently accepts `regex` and `nodeType`, for example, if I wanted all comments:

    tool.lookFor({
        nodeType : 'comment'
    }, function(node){
        //do something
    });
Or, perhaps I want all attributes which have bracketed values in them:

    tool.lookFor({
        nodeType : 'attribute',
        regex : /\[.*?\]/g
    }, function(node){
        //do something
    });

Once you've registered your handlers, you are ready to traverse a DOM:

### DomTool.traverse(domRoot[, options], callback)

This function traverses the DOM with the intent of mutating it. This allows you to quickly index a variety elements on the main DOM, subtrees or fragments. Attributes are only traversed if the option is explicitly passed.

    tool.transform(rootNode, {attributes: true}, function(){
        // do something
    });

### DomTool instances
When I need instances, I work like this:

    var Dom = require('dom-tool');
    var instance = new Dom.Tool();

##Testing

Just run

    mocha

-Abbey Hawk Sparrow
