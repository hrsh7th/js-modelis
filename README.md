js-modelis
===========

Modelis javascript modeling support.

usage
-----------

## basic usage

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

## with plugin

```NOTICE: currently modelis built in 2-plugin. But I will split repository in the future.```

### [monk](http://github.com/LearnBoost/monk)

```js
var Modelis = require('modelis');
var monk = require('monk');

// define.
var User = Modelis.define('User').attr('name').attr('age');

// define plugin.
Modelis.plugins.monk.define(User, {
  collection: 'users',
  connection: monk('localhost/test')
});

// insert.
User.Repository.insert(new User({ name: 'john', age: '19' }), function(err, inserted) {
  inserted.get('name'); #=> john

  // find.
  User.Repository.findById(inserted.primary(), function(err, found) {
    found.get('name') #=> john

    // update.
    found.set('name', 'bob');
    User.Repository.update(found, function(err, updated) {
      updated.get('name', 'bob');

      // remove.
      User.Repository.remove(updated, function(err, removed) {
        User.Repository.findById(updated.primary(), function(err, found) {
          found === null; #=> true
        });
      });
    });
  });

});

### [assurance](http://github.com/danmilon/assurance)

```js
var Modelis = require('modelis');

// define.
var User = Modelis.define('User');
User.attr('name', {
  assurance: {
    is: 'string',
    required: true
  }
});
User.attr('age', {
  assurance: {
    isInt: true
  }
});

// define plugin.
Modelis.plugins.assurance.define(User);

// validate.
var results = new User({}).assurance();
results.length === 1; #=> true. Because name must be required.
});
```

todo
-----------
- writing plugin documents.
- writing more plugins.
- split plugin repository.

