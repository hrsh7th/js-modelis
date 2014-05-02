var assert = require('assert');
var Modelis = require('../');

describe('Modelis.plugins.assurance', function() {

  describe('arguments passing', function() {
    var User = Modelis.define('User').attr('name', { assurance: { is: 'string' } });
    Modelis.plugins.assurance.define(User, { methods: 'assurance' });

    it('success case', function() {
      var user = new User({ name: 'test' });
      assert.equal(user.assurance().length, 0);
    });

    it('failure case', function() {
      var user = new User({ name: 123 });
      assert.equal(user.assurance().length, 1);
    });
  });

  describe('arguments not passing', function() {
    var User = Modelis.define('User').attr('name', { assurance: { required: true } });
    Modelis.plugins.assurance.define(User, { methods: 'assurance' });

    it('success case', function() {
      var user = new User({ name: 'test' });
      assert.equal(user.assurance().length, 0);
    });

    it('failure case', function() {
      var user = new User({ });
      assert.equal(user.assurance().length, 1);
    });
  });

});

