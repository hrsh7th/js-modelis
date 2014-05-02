var _ = require('lodash');
var assurance = require('assurance');
var Modelis = require('./../../../index');

/**
 * define Validator.
 *
 * - api
 *   - Modelised#validate
 *
 * - option
 *   - methods: exports function name.
 *     - default: assurance
 *     - ex) var User = Modelis.define('User');
 *           Modelis.plugins.assurance.define(User, {
 *             methods: 'validate'
 *           });
 *           new User({ }).validate();
 *   - attrOptionKey: use to find option in Modelised attribute option.
 *     - default: assurance
 *     - ex) var User = Modelis.define('User')
 *             .attr('name', {
 *               validate: { is: 'string' }
 *             })
 *           Modelis.plugins.assurance.define(User, {
 *             attrOptionKey: 'validate'
 *           });
 *
 * @param {Object} Modelised Modelis instance.
 * @param {String?} option plugin option.
 */
exports.define = function(Modelised, option) {
  option = _.defaults(option || {}, {
    methods: 'assurance',
    attrOptionKey: 'assurance'
  });

  if (!Modelis.of(Modelised)) throw new Error('Modelis: assurance.define: `Modelised` must be defined Modelis.');

  Modelised.prototype[option.methods] = create(Modelised, option);
};

/**
 * create `Modelised.prototype[option.methods]`.
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

