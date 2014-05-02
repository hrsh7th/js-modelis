var _ = require('lodash');
var monk = require('monk');
var Promise = require('promise');
var Modelis = require('./../../../index');

/**
 * define repository by monk.
 *
 * - api
 *   - Modelised.Repository.drop
 *   - Modelised.Repository.find
 *   - Modelised.Repository.findById
 *   - Modelised.Repository.insert
 *   - Modelised.Repository.update
 *   - Modelised.Repository.remove
 *
 * - option
 *   - statics: exports object name.
 *     - default: Repository
 *     - ex) var User = Modelis.define('User');
 *           Modelis.plugins.monk.define(User, {
 *             statics: 'Store'
 *           });
 *           User.Store.find();
 *   - collection: collection name.
 *     - required.
 *     - ex) var User = Modelis.define('User');
 *           Modelis.plugins.monk.define(User, {
 *             collection: 'users'
 *           });
 *   - connection: connection from monk.
 *     - required.
 *     - ex) var User = Modelis.define('User');
 *           Modelis.plugins.monk.define(User, {
 *             connection: monk('localhost/test')
 *           });
 *
 * @param {Object} Modelised defined Modelised.
 * @param {String?} option plugin option.
 */
exports.define = function(Modelised, option) {
  option = _.defaults(option || {}, {
    statics: 'Repository'
  });

  if (!Modelis.of(Modelised)) throw new Error('Modelis: monk.define: `Modelised` must be defined Modelis.');
  if (!option.connection) throw new Error('Modelis: monk.define: `option`.connection must be provide.')
  if (!option.collection) throw new Error('Modelis: monk.define: `option`.collection must be provide.')

  Modelised[option.statics] = create(Modelised, option);
};

/**
 * create `Modelised[option.statics]`.
 *
 * @param {Object} Modelised defined Modelised.
 * @param {String?} option plugin option.
 */
function create(Modelised, option) {

  /**
   * @type {Object} option
   */
  Repository.option = option;

  /**
   * mongodb repository with monk.
   */
  function Repository() {}

  /**
   * get collection.
   *
   * @return {Object}
   */
  Repository.collection = function() {
    var option = Repository.option;
    return option.connection.get(option.collection);
  };

  /**
   * drop collection.
   *
   * @param {Function?} callback
   */
  Repository.drop = function(callback) {
    callback = _.isFunction(callback) ? callback : _.noop;

    return new Promise(function(resolve, reject) {
      Repository.collection().drop(function(err) {
        callback(err);

        if (err) return reject(err);

        resolve();
      });
    });
  };

  /**
   * find documents.
   *
   * @param {Object} query
   * @param {Function?} callback
   * @return {Object}
   */
  Repository.find = function(query, callback) {
    callback = _.isFunction(callback) ? callback : _.noop;

    return new Promise(function(resolve, reject) {
      Repository.collection().find(query, function(err, objects) {
        var instances = instantiate(objects);

        callback(err, instances);

        if (err) return reject(err);

        resolve(instances);
      });
    });
  };

  /**
   * find document by id.
   *
   * @param {Object} id
   * @param {Function?} callback
   * @return {Object}
   */
  Repository.findById = function(id, callback) {
    callback = _.isFunction(callback) ? callback : _.noop;

    return new Promise(function(resolve, reject) {
      Repository.collection().findById(id, function(err, object) {
        var instance = instantiate(object);

        callback(err, instance);

        if (err) return reject(err);

        resolve(instance);
      });
    });
  };

  /**
   * insert document.
   *
   * @param {Object} modelised
   * @param {Function?} callback
   * @return {Object}
   */
  Repository.insert = function(modelised, callback) {
    callback = _.isFunction(callback) ? callback : _.noop;

    return new Promise(function(resolve, reject) {
      var json = modelised.toJSON({ _id: Modelised.primaryKey() });
      Repository.collection().insert(json, function(err, object) {
        var instance = instantiate(object);

        callback(err, instance);

        if (err) return reject(err);

        modelised.clean(); // clean modelised if insert success.

        resolve(instance);
      });
    });
  };

  /**
   * update document.
   *
   * @param {Object} modelised
   * @param {Function?} callback
   * @return {Object}
   */
  Repository.update = function(modelised, callback) {
    callback = _.isFunction(callback) ? callback : _.noop;

    return new Promise(function(resolve, reject) {
      Repository.collection().update({ _id: modelised.primary() }, { $set: modelised.diff() }, function(err, results) {
        callback(err, results);

        if (err) return reject(err);

        modelised.clean(); // clean modelised if update success.

        resolve(results);
      });
    });
  };

  /**
   * remove document.
   *
   * @param {Object} modelised
   * @param {Function?} callback
   * @return {Object}
   */
  Repository.remove = function(modelised, callback) {
    callback = _.isFunction(callback) ? callback : _.noop;

    return new Promise(function(resolve, reject) {
      Repository.collection().remove({ _id: modelised.primary() }, function(err, results) {
        callback(err, results);

        if (err) return reject(err);

        modelised.clean(); // clean modelised if remove success.

        resolve(results);
      });
    });
  };

  /**
   * mongodb document convert to Modelised instance.
   *
   * @param {Array|Object} objects
   * @return {Array|undefined}
   */
  function instantiate(objects) {
    if (!_.isArray(objects)) {
      if (objects && objects._id) {
        objects[Modelised.primaryKey()] = objects._id;
        return new Modelised(objects);
      }
      return null;
    }
    return _.map(objects, instantiate);
  }

  return Repository;

}

