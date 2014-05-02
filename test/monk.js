var assert = require('assert');
var _ = require('lodash');
var co = require('co');
var monk = require('monk');
var Modelis = require('../');

describe('Modelis.plugins.monk', function() {
    var User = Modelis.define('User')
      .attr('id')
      .attr('name');

    Modelis.plugins.monk.define(User, {
      collection: 'users',
      connection: monk('localhost/test')
    });

    beforeEach(function(done) {
      co(function*() {
        try {
          yield User.Repository.drop();
        } catch (e) {}
      })(done);
    });

    it('insert', function(done) {
      co(function*() {
        var user = yield User.Repository.insert(new User({ name: 'john' }));
        assert.ok(Modelis.instanceof(user));
        assert.equal(user.get('name'), 'john');
      })(done);
    });

    it('update', function(done) {
      co(function*() {
        var user0 = yield User.Repository.insert(new User({ name: 'john' }));

        // change and update name.
        user0.set('name', 'bob');
        yield User.Repository.update(user0);

        var user1 = yield User.Repository.findById(user0.primary());
        assert.equal(user1.get('name'), 'bob');
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

    it('find', function(done) {
      co(function*() {
        yield User.Repository.insert(new User({ name: 'john' }));
        yield User.Repository.insert(new User({ name: 'bob' }));
        var users = yield User.Repository.find({});
        assert.equal(users.length, 2);
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
        assert.equal(users.length, 0);
      })(done);
    });

    it('findById', function(done) {
      co(function*() {
        var user0 = yield User.Repository.insert(new User({ name: 'john' }));
        var user1 = yield User.Repository.findById(user0.primary());
        assert.ok(user1.get('name') === 'john');
      })(done);
    });

    it('findOne(empty)', function(done) {
      co(function*() {
        var user0 = yield User.Repository.insert(new User({ name: 'john' }));
        var user1 = yield User.Repository.findById('');
        assert.ok(user1 === null);
      })(done);
    });

});


