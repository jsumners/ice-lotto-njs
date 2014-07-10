# Style Guide

## JavaScript

The primary style guide for the JavaScript in this project can be found in the [AirBnb style guide][airbnb]. This document will detail the few differences.

### General

#### Comments
Multiline comments should be reserved for document headers and temporary code removal. In all other instances, single line comments should be used.

Bad:

```javascript
function foo() {
  /*
  This variable is used for things.
  Things are good.
  */
  var bar;

  ...
}
```

Good:

```javascript
/**
 * This is a super cool function.
 */
function foo() {
  // This variable is used for things.
  // Things are good.
  var bar;

  /*
  // Who wrote this mess?
  var foobar = 42;
  foobar = function() {
    return 42;
  };
  */
}
```

#### Functions

Immediately invoked function expressions should use the inner parenthesis syntax.

Bad:

```javascript
var Foo = (function() { ... })();
```

Good:

```javascript
var Foo = (function() { ... }());
```

### Node.js Scripts

#### Variables

Multiple `var` statements are allowed in order to separate "requires" and actual "variables." For example:

```javascript
var express = require('express');

var app = express(),
    server = {};

server = app.listen(8080, ...);
```

### Client Scripts

Client scripts are JavaScripts that will run in a client's web browser (i.e. outside of Node.js).

Whereas Node.js loads each script in its own scope, browsers load all scripts into the same scope: global (`window`). Client scripts in this project should load as little into the global scope as possible.

Bad:

```javascript
var Foo = function() {
  if (!(this instanceof Foo)) {
    return new Foo();
  }
  ...
};

var myFoo = new Foo();
```

Good:

```javascript
(function() {
  var Foo = function(){},
      myFoo = {};

  Foo = function() {
    if (!(this instanceof Foo)) {
      return new Foo();
    }
    ...
  };

  myFoo = new Foo();
}());
```

[airbnb]: https://github.com/airbnb/javascript