Modelis.
===========

Modelis is very simple javascript modeling module on server-side and client-side.

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
user.get('name'); #=> john
user.get('age');  #=> 19

// set.
user.set('name', 'bob');

// changed.
user.get('name'); #=> bob
```

## Plugin

```NOTICE: currently modelis built in 2-plugin. But I will split repository in the future.```

### [monk](http://github.com/LearnBoost/monk)

#### Export API

- Modelised.Repository.drop
- Modelised.Repository.find
- Modelised.Repository.findById
- Modelised.Repository.insert
- Modelised.Repository.update
- Modelised.Repository.remove

#### Option

- ```connection``` (required)
  - monk connection.
- ```collection``` (required)
  - mongodb collection name.
- ```statics``` (optional, default=Repository)
  - object name to export to Modelis.

#### Example

##### callback

```js
var Modelis = require('modelis');
var monk = require('monk');

// define.
var User = Modelis.define('User').attr('name').attr('age');

// define plugin.
Modelis.plugins.monk.define(User, {
  statics: 'Store',                  // default: Repository.
  collection: 'users',               // required.
  connection: monk('localhost/test') // required.
});

// insert.
User.Store.insert(new User({ name: 'john', age: '19' }), function(err, inserted) {
  inserted.get('name'); #=> john

  // find.
  User.Store.findById(inserted.primary(), function(err, found) {
    found.get('name') #=> john

    // update.
    found.set('name', 'bob');
    User.Store.update(found, function(err, updated) {
      updated.get('name'); #=> bob

      // remove.
      User.Store.remove(updated, function(err, removed) {
        User.Store.findById(updated.primary(), function(err, found) {
          found === null; #=> true. Because user(john) was deleted.
        });
      });
    });
  });

});
```

##### generators(co)

```js
var Modelis = require('modelis');
var monk = require('monk');
var co = require('co');

// define.
var User = Modelis.define('User').attr('name').attr('age');

// define plugin.
Modelis.plugins.monk.define(User, {
  statics: 'Store',                  // default: Repository.
  collection: 'users',               // required.
  connection: monk('localhost/test') // required.
});

co(function*() {
  // insert.
  var inserted = yield User.Store.insert(new User({ name: 'john', age: '19' }));
  inserted.get('name'); #=> john

  // find.
  var found = yield User.Store.findById(inserted.primary());
  found.get('name') #=> john

  // update.
  found.set('name', 'bob');
  yield User.Store.update(found); #=> affected rows count: 1.
  var updated = yield User.Store.findById(found.primary());
  updated.get('name') #=> bob

  // remove.
  yield User.Store.remove(updated); #=> affected rows count: 1.
  var removed = yield User.Store.findById(updated.primary());
  removed === null; #=> true. Because `updated` was deleted.
})();
```

### [assurance](http://github.com/danmilon/assurance)

#### Export API

- Modelised#assurance

#### Option

- ```methods``` (optional, default=assurance)
  - method name to export to Modelised instance.
- ```attrOptionKey``` (optional, default=assurance)
  - option key in attribute's option to see by this plugin.

#### Example

```js
var Modelis = require('modelis');

// define.
var User = Modelis.define('User');
User.attr('name', {
  validate: {
    is: 'string',
    required: true
  }
});
User.attr('age', {
  validate: {
    isInt: true
  }
});

// define plugin.
Modelis.plugins.assurance.define(User, {
  methods: 'validate',      // default: `assurance`.
  attrOptionKey: 'validate' // default: `assurance`.
});

// validate.
var results = new User({}).validate();
results.length === 1; #=> true. Because name must be required.
```

Todo
-----------
- implement plugin's base module.
  - split plugin repository.
  - writing more plugins.
- writing plugin documents.

