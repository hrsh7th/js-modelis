var _ = require('lodash');
var Emitter = require('component-emitter');

/**
 * Built-in plugins.
 * NOTICE: deprecated.
 */
exports.plugins = {};
exports.plugins.assurance = require('./lib/plugins/assurance');
exports.plugins.monk = require('./lib/plugins/monk');


/**
 * check defined Modelised.
 *
 * @param {Object} Modelised target object.
 * @return {Boolean}
 */
exports.of = function(Modelised) {
  return _.isFunction(Modelised) && Modelised.prototype.constructor === ModelizeBase;
};

/**
 * check instanceof Modelis.
 *
 * @param {Object} modelised target object.
 * @return {Boolean}
 */
exports.instanceof = function(modelised) {
  return _.isObject(modelised) && modelised instanceof ModelizeBase;
};

/**
 * define Model.
 *
 * - option
 *   - primaryKey: primary key name.
 *     - default: id
 *     - ex) var User = Modelis.define('User', { primaryKey: 'sample' }).attr('sample');
 *           var user = new User({ sample: 1234567890 });
 *           user.primary() #=> 1234567890
 *
 * @param {String} name Modelis constructor name.
 * @param {Object?} option Modelis option.
 */
exports.define = function(name, option) {
  if (!_.isString(name)) throw new Error('Modelis.define: `name` must be string.');
  if (!name.length) throw new Error('Modelis.define: `name` must be length > 0.');

  option = option || {};
  _.defaults(option , { primaryKey: 'id' });

  return create(name, option);
};

/**
 * ModelizeBase.
 */
function ModelizeBase() {}

/**
 * create Modelis.
 *
 * @param {String} name Modelis constructor name.
 * @param {Object} option Modelis option.
 */
function create(name, option) {

  /**
   * for Modelis.instanceof.
   */
  Modelis.prototype = new ModelizeBase();

  /**
   * for Modelis.of.
   */
  Modelis.prototype.constructor = ModelizeBase;

  /**
   * @type {String} name
   */
  Modelis.name = name;

  /**
   * @type {Object} attrs.
   */
  Modelis.attrs = {};

  /**
   * @type {Object} option.
   */
  Modelis.option = option;

  /**
   * Modelis.
   *   .primaryKey
   *   .attr
   *   #primary
   *   #diff
   *   #clean
   *   #get
   *   #set
   *   #toJSON
   *
   * @param {Object?} values initial values.
   */
  function Modelis(values) {
    values = _.isPlainObject(values) ? values : {};

    Emitter(this);

    this._diff = {};
    this._values = {};
    _.forOwn(Modelis.attrs, function(option, key) {
      this._values[key] = values[key];
    }, this);
  }

  /**
   * get primary key.
   *
   * @return {String}
   */
  Modelis.primaryKey = function() {
    return Modelis.option.primaryKey;
  };

  /**
   * create attribute and getter/setter with option.
   *
   * @param {String} key attributeKey.
   * @param {Object?} option attribute option.
   */
  Modelis.attr = function(key, option) {
    if (!_.isString(key)) throw new Error('Modelis.attr: `key` must be string.')
    if (!key.length) throw new Error('Modelis.attr: `key` must be length > 0.')

    Modelis.attrs[key] = _.isPlainObject(option) ? option : {};

    return Modelis;
  };

  /**
   * get primary key's value.
   *
   * @return {Object}
   */
  Modelis.prototype.primary = function() {
    return this._values[Modelis.primaryKey()];
  };

  /**
   * get diff since from constructed or called clean.
   */
  Modelis.prototype.diff = function() {
    return this._diff;
  };

  /**
   * clean diff.
   */
  Modelis.prototype.clean = function() {
    this._diff = {};
  };

  /**
   * get value.
   *
   * @param {String} key
   * @return {Object}
   */
  Modelis.prototype.get = function(key) {
    if (!Modelis.attrs.hasOwnProperty(key)) throw new Error('Modelis#get: `key` was not found in defined attrs.');

    return this._values[key];
  };

  /**
   * set value.
   *
   * @param {String} key
   * @param {Object} value
   * @return {Object}
   */
  Modelis.prototype.set = function(key, value) {
    if (!Modelis.attrs.hasOwnProperty(key)) throw new Error('Modelis#set: `key` was not found in defined attrs.');

    this._diff[key] = value;
    this._values[key] = value;

    return this;
  };

  /**
   * toJSON.
   *
   * @param {Object?} aliases
   * @return {Object}
   */
  Modelis.prototype.toJSON = function(aliases) {
    aliases = _.isPlainObject(aliases) ? aliases : {};
    aliases = _.invert(aliases);

    var json = {};
    _.forOwn(JSON.parse(JSON.stringify(this._values)), function(value, key) {
      key = aliases.hasOwnProperty(key) ? aliases[key] : key;
      json[key] = value;
    });
    return json;
  };

  return Modelis;

}

