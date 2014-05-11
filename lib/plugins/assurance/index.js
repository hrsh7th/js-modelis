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
  var api = [
    { name: 'required', pass: false },
    { name: 'optional', pass: false },
    { name: 'is', pass: true },
    { name: 'lt', pass: true },
    { name: 'gt', pass: true },
    { name: 'max', pass: true },
    { name: 'min', pass: true },
    { name: 'equals', pass: true },
    { name: 'notEquals', pass: true },
    { name: 'oneOf', pass: true },
    { name: 'isEmail', pass: false },
    { name: 'isInt', pass: false },
    { name: 'matches', pass: true },
    { name: 'len', pass: true },
    { name: 'consistsOf', pass: true }
  ];

  // this function's context is Modelised instance.
  return function () {
    var assure = assurance(this.toJSON());

    // each attrs.
    _.forOwn(Modelised.attrs, function(attrOption, attrKey) {
      var assuranceOption = attrOption[option.attrOptionKey];
      assuranceOption = _.isPlainObject(assuranceOption) ? assuranceOption : {};
      assuranceOption.optional = !!!assuranceOption.required;
      assuranceOption.required = !!!assuranceOption.optional;

      // each api.
      var check = assure.check(attrKey);
      _.forEach(api, function(setting) {
        var assuranceFunctionName = setting.name;
        var isArgumentsPassing = setting.pass;

        if (isArgumentsPassing && assuranceOption.hasOwnProperty(assuranceFunctionName)) {
          check[assuranceFunctionName].call(check, assuranceOption[assuranceFunctionName]);
        }
        if (!isArgumentsPassing && !!assuranceOption[assuranceFunctionName]) {
          check[assuranceFunctionName].call(check);
        }
      });
    });

    return assure.end();
  };

}

