var assert = require('assert');
var Modelis = require('../');

describe('Modelis', function() {

  describe('nest', function() {
    var User = Modelis.define('User').attr('id').attr('name');
    var School = Modelis.define('School', { primaryKey: '_id' })
      .attr('_id')
      .attr('name')
      .attr('users', {
        nest: User
      })
      .attr('empty');

    it('not modelis instance', function() {
      var school = new School({
        name: 'some-high-school',
        users: [{
          name: 'john'
        }]
      });
      assert.ok(Modelis.instanceof(school.get('users')[0]));
    });

    it('modelis instance', function() {
      var school = new School({
        name: 'some-high-school',
        users: [new User({
          name: 'john'
        })]
      });
      assert.ok(Modelis.instanceof(school.get('users')[0]));
    });

    it('mix', function() {
      var school = new School({
        name: 'some-high-school',
        users: [new User({
          name: 'john'
        }), {
          name: 'bob'
        }]
      });
      assert.ok(Modelis.instanceof(school.get('users')[0]));
    });

  });

});

