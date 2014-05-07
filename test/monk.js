var assert = require('assert');
var _ = require('lodash');
var co = require('co');
var Modelis = require('../');

describe('Modelis.plugins.monk', function() {
  var User = Modelis.define('User')
    .attr('id')
    .attr('name');

  User.use(Modelis.plugins.monk({
    collection: 'users',
    connection: 'localhost/test'
  }));

  beforeEach(function(done) {
    co(function*() {
      try {
        yield User.Repository.drop();
      } catch (e) {}
    })(done);
  });

  it('find', function(done) {
    co(function*() {
      yield User.Repository.insert(new User({ name: 'john' }));
      yield User.Repository.insert(new User({ name: 'bob' }));
      var users = yield User.Repository.find({});
      assert.ok(users.length === 2);
      assert.ok(_.indexOf(['john', 'bob'], users[0].get('name')) > -1);
      assert.ok(_.indexOf(['john', 'bob'], users[1].get('name')) > -1);
      assert.ok(users[0].get('name') !== users[1].get('name'))
    })(done);
  });

  it('find(empty)', function(done) {
    co(function*() {
      yield User.Repository.insert(new User({ name: 'john' }));
      yield User.Repository.insert(new User({ name: 'bob' }));
      var users = yield User.Repository.find({ name: 'alex' });
      assert.ok(users.length === 0);
    })(done);
  });

  it('findOne', function(done) {
    co(function*() {
      var user0 = yield User.Repository.insert(new User({ name: 'john' }));
      var user1 = yield User.Repository.findOne({ _id: user0.primary() });
      assert.ok(user1.get('name') === 'john');
    })(done);
  });

  it('findOne(empty)', function(done) {
    co(function*() {
      var user0 = yield User.Repository.insert(new User({ name: 'john' }));
      var user1 = yield User.Repository.findOne({ name: '' });
      assert.ok(user1 === null);
    })(done);
  });

  it('findById', function(done) {
    co(function*() {
      var user0 = yield User.Repository.insert(new User({ name: 'john' }));
      var user1 = yield User.Repository.findById(user0.primary());
      assert.ok(user1.get('name') === 'john');
    })(done);
  });

  it('findById(empty)', function(done) {
    co(function*() {
      var user0 = yield User.Repository.insert(new User({ name: 'john' }));
      var user1 = yield User.Repository.findById('');
      assert.ok(user1 === null);
    })(done);
  });

  it('findAndModify', function(done) {
    co(function*() {
      var user0 = yield User.Repository.insert(new User({ name: 'john' }));
      var user1 = yield User.Repository.findAndModify({ name: 'john' }, { name: 'bob' });
      assert.ok(user1.get('name') === 'john');
      var user2 = yield User.Repository.findOne({ name: 'bob' });
      assert.ok(user2.get('name') === 'bob');
    })(done);
  });

  it('findAndModify(empty)', function(done) {
    co(function*() {
      var user0 = yield User.Repository.insert(new User({ name: 'john' }));
      var user1 = yield User.Repository.findAndModify({ name: '' }, { name: 'bob' });
      assert.ok(user1 === null);
      var user2 = yield User.Repository.findOne({ name: 'john' });
      assert.ok(user2.get('name') === 'john');
    })(done);
  });

  it('insert', function(done) {
    co(function*() {
      var user = yield User.Repository.insert(new User({ name: 'john' }));
      assert.ok(Modelis.instanceof(user));
      assert.ok(user.get('name') === 'john');
    })(done);
  });

  it('update', function(done) {
    co(function*() {
      var user0 = yield User.Repository.insert(new User({ name: 'john' }));

      // change and update name.
      user0.set('name', 'bob');
      yield User.Repository.update(user0);

      var user1 = yield User.Repository.findById(user0.primary());
      assert.ok(user1.get('name') === 'bob');
    })(done);
  });

  it('remove', function(done) {
    co(function*() {
      var user0 = yield User.Repository.insert(new User({ name: 'john' }));
      yield User.Repository.remove(user0);
      var user1 = yield User.Repository.findById(user0.primary());
      assert.ok(!user1);
    })(done);
  });

});


