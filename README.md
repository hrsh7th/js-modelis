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

### [monk](http://github.com/LearnBoost/monk)

#### Export API

- Repository.connection
- Repository.collection
- Repository.drop
- Repository.find
- Repository.findOne
- Repository.findById
- Repository.findAndModify
- Repository.insert
- Repository.update
- Repository.remove

#### Option

- ```connection``` (required)
  - monk connection.
- ```collection``` (required)
  - mongodb collection name.

#### Example

##### use.

```js
var Modelis = require('modelis');

// define.
var User = Modelis.define('User').attr('name').attr('age');

if (simple) {
  // use.
  User.use(Modelis.plugins.monk({
    collection: 'users',
    connection: 'localhost/test'
  });

  // User.Repository is available.
  User.Repository.drop(function() {});
}

if (customize) {
  // use.
  User.use(Modelis.plugins.monk({
    collection: 'users',
    connection: 'localhost/test'
  }, function(Repository) {
    this; //=> User.
    this.Store = Repository;
  });

  // User.Store is available.
  User.Store.drop(function() {});
}
```

##### callback

```js
var Modelis = require('modelis');

// define.
var User = Modelis.define('User').attr('name').attr('age');

// use.
User.use(Modelis.plugins.monk({
  collection: 'users',
  connection: 'localhost/test'
}));

// connection.
User.Repository.connection(); //=> monk connection.

// collection.
User.Repository.collection(); //=> monk collection.

// insert.
User.Repository.insert(new User({ name: 'john', age: 19 }), function(err, inserted) {
  inserted.get('name'); //=> john

  // find.
  User.Repository.findById(inserted.primary(), function(err, found) {
    found.get('name') //=> john

    // update.
    found.set('name', 'bob');
    User.Repository.update(found, function(err, updated) {
      updated.get('name'); //=> bob

      // remove.
      User.Repository.remove(updated, function(err, removed) {
        User.Repository.findById(updated.primary(), function(err, found) {
          found === null; //=> true. `updated`(john) was deleted.
        });
      });
    });
  });

});
```

##### generators(co)

```js
var Modelis = require('modelis');
var co = require('co');

// define.
var User = Modelis.define('User').attr('name').attr('age');

// define plugin.
User.use(Modelis.plugins.monk({
  collection: 'users',
  connection: 'localhost/test'
}));

co(function*() {
  // insert.
  var inserted = yield User.Repository.insert(new User({ name: 'john', age: 19 }));
  inserted.get('name'); //=> john

  // find.
  var found = yield User.Repository.findById(inserted.primary());
  found.get('name') //=> john

  // update.
  found.set('name', 'bob');
  yield User.Repository.update(found); //=> affected rows count: 1.
  var updated = yield User.Repository.findById(found.primary());
  updated.get('name') //=> bob

  // remove.
  yield User.Repository.remove(updated); //=> affected rows count: 1.
  var removed = yield User.Repository.findById(updated.primary());
  removed === null; //=> true. `updated` was deleted.
})();
```

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

