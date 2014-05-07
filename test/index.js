var assert = require('assert');
var Modelis = require('../');

describe('Modelis', function() {

  var User = Modelis.define('User')
    .attr('id')
    .attr('name');

  var School = Modelis.define('School', { primaryKey: '_id' })
    .attr('_id')
    .attr('name')
    .attr('users')
    .attr('empty');

  describe('.of', function() {
    it('basic usage', function() {
      assert.ok(Modelis.of(User));
      assert.ok(!Modelis.of({}));
    });
  });

  describe('.instanceof', function() {
    it('basic usage', function() {
      var user = new User();
      var school = new School();
      assert.ok(Modelis.instanceof(user));
      assert.ok(Modelis.instanceof(school));
      assert.ok(!Modelis.instanceof({}));
    });
  });

  describe('.use', function() {
    User.use(function() {
      this.prototype.add = function(x, y) {
        return x + y;
      };
    });
    var user = new User();
    assert.equal(user.add(1, 2), 3);
  });

  describe('.define', function() {
    it('attrs', function() {
      assert.ok(School.attrs.hasOwnProperty('users'));
      assert.ok(User.attrs.hasOwnProperty('name'));
      assert.ok(!User.attrs.hasOwnProperty('users'));
    });
    it('instanceof', function() {
      var user = new User();
      var school = new School();
      assert.ok(user instanceof User);
      assert.ok(!(user instanceof School));
    });
  });

  describe('#primary', function() {
    it('basic usage', function() {
      var user = new User({ id: 1234567890 });
      assert.equal(user.primary(), 1234567890);
    });
    it('primaryKey changed', function() {
      var school = new School({ _id: 1234567890 });
      assert.equal(school.primary(), 1234567890);
    });
  });

  describe('#diff', function() {
    it('basic usage', function() {
      var user = new User({ name: 'john' });
      assert.equal(Object.keys(user.diff()).length, 0);
      user.set('name', 'bob');
      assert.equal(Object.keys(user.diff()).length, 1);
    });
  });

  describe('#clean', function() {
    it('basic usage', function() {
      var user = new User({ name: 'john' });
      user.set('name', 'bob');
      assert.equal(Object.keys(user.diff()).length, 1);
      user.clean();
      assert.equal(Object.keys(user.diff()).length, 0);
    });
  });

  describe('#get', function() {
    it('values setting in constructor', function() {
      var user = new User({ name: 'john' });
      assert.equal(user.get('name'), 'john');
    });
    it('values setting in set method.', function() {
      var user = new User();
      user.set('name', 'john');
      assert.equal(user.get('name'), 'john');
    });
  });

  describe('#set', function() {
    it('change constructor argument', function() {
      var user = new User({ name: 'john' });
      assert.equal(user.get('name'), 'john');
      user.set('name', 'bob');
      assert.equal(user.get('name'), 'bob');
    });
  });

  describe('#toJSON', function() {
    it('basic usage', function() {
      var school = new School({
        name: 'some-high-school',
        users: [new User({ name: 'john' })]
      });
      var data = school.toJSON();
      assert.equal(data.name, 'some-high-school');
      assert.equal(data.users[0].name, 'john');
      assert.ok(!data.hasOwnProperty('empty')); // undefined value was omitted.
    });
    it('alias', function() {
      var user = new User({ id: 1234567890 });
      var data = user.toJSON({ _id: 'id' });
      assert.equal(data._id, 1234567890);
      assert.ok(!data.hasOwnProperty('id'));
    });
  });

  describe('inherit Emitter', function() {
    it('basic usage', function(done) {
      var user = new User();
      user.on('check', done);
      user.emit('check');
    });
  });

});

