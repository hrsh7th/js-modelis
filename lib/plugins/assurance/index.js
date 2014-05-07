var _ = require('lodash');
var assurance = require('assurance');
var Modelis = require('./../../../index');

/**
 * define Validator.
 *
 * @param {String?} option plugin option.
 */
module.exports = function(option, callback) {
  option = _.defaults(option || {}, {
    attrOptionKey: 'assurance'
  });
  callback = _.isFunction(callback) ? callback : defaults;

  return function() {
    callback.call(this, create(this, option));
  };

  /**
   * default callback function.
   *
   * - validate
   *
   * @param {Function} assurance
   */
  function defaults(assurance) {
    this.prototype.assurance = assurance;
  }
};

/**
 * create.
 *
 * @param {Object} Modelised defined Modelised.
 * @param {String?} option plugin option.
 */
function create(Modelised, option) {
  // `true`: direct passing option to assurance arguments.
  // `false`: apply assurance if attrOption's value is truthy.
  var api = {
    is: true,
    gt: true,
    lt: true,
    max: true,
    min: true,
    equals: true,
    notEquals: true,
    required: false,
    oneOf: true,
    isEmail: false,
    isInt: false,
    matches: true,
    len: true,
    consistsOf: true
  };

  // this function's context is Modelised instance.
  return function () {
    var assure = assurance(this.toJSON());

    // each attrs.
    _.forOwn(Modelised.attrs, function(attrOption, attrKey) {
      var assuranceOption = attrOption[option.attrOptionKey];

      // one attrs.
      _.forOwn(api, function(isArgumentsPassing, assuranceFunctionName) {
        if (isArgumentsPassing && assuranceOption.hasOwnProperty(assuranceFunctionName)) {
          var me = assure.me(attrKey);
          me[assuranceFunctionName].call(me, assuranceOption[assuranceFunctionName])
        }
        if (!isArgumentsPassing && !!assuranceOption[assuranceFunctionName]) {
          assure.me(attrKey)[assuranceFunctionName]();
        }
      });
    });

    return assure.end();
  };

}

