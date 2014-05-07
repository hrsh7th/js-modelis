var _ = require('lodash');
var monk = require('monk');
var Promise = require('promise');
var Modelis = require('./../../../index');

/**
 * define repository by monk.
 *
 * @param {Object} option
 * @param {Function?} callback
 */
module.exports = function(option, callback) {
  option = option || {};
  callback = _.isFunction(callback) ? callback : defaults;

  if (!option.connection)
    throw new Error('Modelis: monk.define: `option`.connection must be provide.');
  if (!option.collection)
    throw new Error('Modelis: monk.define: `option`.collection must be provide.');

  return function() {
    callback.call(this, create(this, option));
  };

  /**
   * default callback function.
   *
   * @param {Object} Repository
   */
  function defaults(Repository) {
    this.Repository = Repository;
  }
};

/**
 * connections.
 */
var connections = {};

/**
 * create.
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
   * get connection.
   *
   * @return {Object}
   */
  Repository.connection = function() {
    return connections[option.connection]
      || (connections[option.connection] = monk(option.connection));
  };

  /**
   * get collection.
   *
   * @return {Object}
   */
  Repository.collection = function() {
    return this.connection().get(option.collection);
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
   * find document.
   *
   * @param {Object} query
   * @param {Function?} callback
   * @return {Object}
   */
  Repository.findOne = function(query, callback) {
    callback = _.isFunction(callback) ? callback : _.noop;

    return new Promise(function(resolve, reject) {
      Repository.collection().findOne(query, function(err, object) {
        var instance = instantiate(object);

        callback(err, instance);

        if (err) return reject(err);

        resolve(instance);
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
   * find and modify document.
   *
   * @param {Object} id
   * @param {Function?} callback
   * @return {Object}
   */
  Repository.findAndModify = function(query, values, callback) {
    callback = _.isFunction(callback) ? callback : _.noop;

    return new Promise(function(resolve, reject) {
      Repository.collection().findAndModify(query, { $set: values }, function(err, objects) {
        var instances = instantiate(objects);

        callback(err, instances);

        if (err) return reject(err);

        resolve(instances);
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


