var _ = require('lodash');
var Modelis = require('../');

/**
 * nest.
 */
module.exports = function() {
  return function nest() {
    var Modelised = this;

    this.prototype.set.use(function(key, value, next) {
      var nest = Modelised.attrs[key].nest;
      if (nest) {
        value = instantiate(nest, value);
      }
      return next(key, value);
    });
  }
};

/**
 * instantiate.
 *
 * @param {Function} nest
 * @param {Array.<Object|Function>|Object|Function} value
 * @return {{Array.<Object>|Object}}
 */
function instantiate(nest, value) {
  if (!_.isArray(value)) {
    if (Modelis.instanceof(value)) {
      return value;
    }
    return new nest(value);
  }

  return _.map(value, function(v) {
    return instantiate(nest, v);
  });
}

