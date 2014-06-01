Modelis.
===========

Modelis is very simple javascript modeling module on server-side and client-side.

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

## Plugin

```NOTICE: currently modelis built in 2-plugin. But I will split repository in the future.```

### [assurance](http://github.com/danmilon/assurance)

#### Export API

- Modelised#assurance

#### Option

- ```attrOptionKey``` (optional, default=assurance)
  - key name for plug-in to see attribute's option.

#### Example

##### use.

```js
var Modelis = require('modelis');

if (simple) {
  // define.
  var User = Modelis.define('User').attr('name', { assurance: { is: 'string' }});

  // use.
  User.use(Modelis.plugins.assurance());

  // User#assurance is available.
  new User({}).assurance();
}

if (customize) {
  // define.
  var User = Modelis.define('User').attr('name', { validate: { is: 'string' }});

  // use.
  User.use(Modelis.plugins.assurance({
    attrOptionKey: 'validate'
  }, function(assurance) {
    this; //=> User.
    this.prototype.validate = assurance;
  }));

  // User#validate is available.
  new User({}).validate();
}
```

Todo
-----------
- implement plugin's base module.
  - split plugin repository.
  - writing more plugins.
- writing plugin documents.

