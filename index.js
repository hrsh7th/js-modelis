var _ = require('lodash');
var decoratable = require('decoratable');
var Emitter = require('component-emitter');

/**
 * Built-in plugins.
 * NOTICE: deprecated.
 */
exports.plugins = {};
exports.plugins.assurance = require('./lib/plugins/assurance');

/**
 * check defined Modelised.
 *
 * @param {Object} Modelised target object.
 * @return {Boolean}
 */
exports.of = function(Modelised) {
  return _.isFunction(Modelised) && Modelised.prototype.constructor.name === 'ModelisBase';
};

/**
 * check instanceof Modelis.
 *
 * @param {Object} modelised target object.
 * @return {Boolean}
 */
exports.instanceof = function(modelised) {
  return _.isObject(modelised) && modelised.constructor && modelised.constructor.name === 'ModelisBase';
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

  option = _.defaults(option || {}, { primaryKey: 'id' });

  return create(name, option);
};

/**
 * ModelisBase.
 */
function ModelisBase() {}

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
  Modelis.prototype = new ModelisBase();

  /**
   * for Modelis.of.
   */
  Modelis.prototype.constructor = ModelisBase;

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
   *   -> set before
   *   -> set after
   *   -> clean before
   *   -> clean after
   *   .use()
   *   .primaryKey()
   *   .attr()
   *   #primary()
   *   #diff()
   *   #clean()
   *   #get()
   *   #set()
   *   #toJSON()
   *
   * @param {Object?} values initial values.
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
   * apply plugin.
   */
  Modelis.use = function(fn) {
    fn.call(this);
  };

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
    if (!_.isString(key)) throw new Error('Modelis.attr: `key` must be string.');
    if (!key.length) throw new Error('Modelis.attr: `key` must be length > 0.');

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
   * merge values.
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
   * clean diff.
   */
  Modelis.prototype.clean = function() {
    this.emit('clean before', this);
    this._diff = {};
    this.emit('clean after', this);
  };

  /**
   * get value.
   *
   * decoratable.
   *
   * @param {String} key
   * @return {Object}
   */
  Modelis.prototype.get = decoratable(function get(key) {
    if (!Modelis.attrs.hasOwnProperty(key)) throw new Error('Modelis#get: `key` was not found in defined attrs.');
    return this._values[key];
  });

  /**
   * set value.
   *
   * decoratable.
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

  return Modelis;

}

