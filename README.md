Modelis.
===========

Modelis is very simple javascript modeling module for server-side and client-side.

this module is exprimental version.

Usage
===========

## Basic

```js
var Modelis = require('modelis');

// define.
var User = Modelis.define('User');
User.attr('name');
User.attr('age');

// instantiate.
var user = new User({
  name: 'john',
  age: 19
});

// get.
user.get('name'); //=> john
user.get('age');  //=> 19

// set.
user.set('name', 'bob');

// changed.
user.get('name'); //=> bob
```

