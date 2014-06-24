var _ = require('lodash');
var decoratable = require('decoratable');
var Emitter = require('component-emitter');
var nest = require('./lib/nest');

/**
 * of.
 *
 * @param {Object} Modelised
 * @return {Boolean}
 */
exports.of = function(Modelised) {
  return _.isFunction(Modelised) && Modelised.prototype.constructor.name === 'ModelisBase';
};

/**
 * instanceof.
 *
 * @param {Object} modelised
 * @return {Boolean}
 */
exports.instanceof = function(modelised) {
  return _.isObject(modelised) && modelised.constructor && modelised.constructor.name === 'ModelisBase';
};

/**
 * define.
 *
 * @param {String} name
 * @param {Object?} option
 */
exports.define = function(name, option) {
  if (!_.isString(name) || !name.length) throw new Error('name is required.');

  option = _.defaults(option || {}, { primaryKey: 'id' });

  return create(name, option);
};

/**
 * ModelisBase.
 */
function ModelisBase() {}

/**
 * create.
 *
 * @param {String} name
 * @param {Object} option
 */
function create(name, option) {

  /**
   * for Modelis.instanceof.
   */
  Modelis.prototype = new ModelisBase();

  /**
   * for Modelis.of.
   */
  Modelis.prototype.constructor = ModelisBase;

  /**
   * inherit emitter.
   */
  Emitter(Modelis);

  /**
   * @type {String} name
   */
  Modelis.name = name;

  /**
   * @type {Array.<String>} used
   */
  Modelis.used = [];

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
   *
   * @param {Object?} values
   */
  function Modelis(values) {
    Emitter(this);

    values = _.isPlainObject(values) ? values : {};

    this._diff = {};
    this._values = {};
    _.forOwn(Modelis.attrs, function(option, key) {
      this.set(key, values[key]);
    }, this);
    this.clean();
  }

  /**
   * use.
   *
   * @param {Function} fn
   */
  Modelis.use = function(fn) {
    if (!fn.name) throw new Error('argument should has `name` property.');
    if (this.used.indexOf(fn.name) > 0) throw new Error(fn.name + ' can not dupulicate use.');

    fn.call(this);
    this.used.push(fn.name);
    this.emit('use ' + fn.name);
  };

  /**
   * primaryKey.
   *
   * @return {String}
   */
  Modelis.primaryKey = function() {
    return Modelis.option.primaryKey;
  };

  /**
   * attr.
   *
   * @param {String} key
   * @param {Object?} option
   */
  Modelis.attr = function(key, option) {
    if (!_.isString(key) || !key.length) throw new Error('key is required.');

    Modelis.attrs[key] = _.isPlainObject(option) ? option : {};

    return Modelis;
  };

  /**
   * primary.
   *
   * @return {Object}
   */
  Modelis.prototype.primary = function() {
    return this._values[Modelis.primaryKey()];
  };

  /**
   * diff.
   *
   * @return {Object}
   */
  Modelis.prototype.diff = function() {
    return this._diff;
  };

  /**
   * merge.
   *
   * @param {Object} values
   */
  Modelis.prototype.merge = function(values) {
    this.emit('merge before', this);
    _.forOwn(Modelis.attrs, function(option, key) {
      this.set(key, values[key]);
    }, this);
    this.emit('merge after', this);
  };

  /**
   * clean.
   */
  Modelis.prototype.clean = function() {
    this.emit('clean before', this);
    this._diff = {};
    this.emit('clean after', this);
  };

  /**
   * get.
   *
   * @param {String} key
   * @return {Object}
   */
  Modelis.prototype.get = decoratable(function get(key) {
    if (!Modelis.attrs.hasOwnProperty(key)) throw new Error('Modelis#get: `key` was not found in defined attrs.');
    return this._values[key];
  });

  /**
   * set.
   *
   * @param {String} key
   * @param {Object} value
   * @return {Object}
   */
  Modelis.prototype.set = decoratable(function set(key, value) {
    if (!Modelis.attrs.hasOwnProperty(key)) throw new Error('Modelis#set: `key` was not found in defined attrs.');
    this.emit('set before', this);
    this._diff[key] = value;
    this._values[key] = value;
    this.emit('set after', this);
    return this;
  });

  /**
   * toJSON.
   *
   * @param {Object?} aliases
   * @return {Object}
   */
  Modelis.prototype.toJSON = function(aliases) {
    aliases = _.isPlainObject(aliases) ? aliases : {};
    aliases = _.invert(aliases);

    var values = _.mapValues(this._values, function(value, key) {
      return this.get(key);
    }, this);

    var json = {};
    _.forOwn(values, function(value, key) {
      key = aliases.hasOwnProperty(key) ? aliases[key] : key;
      json[key] = value;
    });
    return JSON.parse(JSON.stringify(json));
  };

  /**
   * use.
   */
  Modelis.use(nest());

  return Modelis;

}

