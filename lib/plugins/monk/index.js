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
    callback.apply(this, create(this, option));
  };

  /**
   * default callback function.
   *
   * @param {Object} Repository
   * @param {Object} methods
   */
  function defaults(Repository, methods) {
    this.Repository = Repository;
    this.prototype.insert = methods.insert;
    this.prototype.update = methods.update;
    this.prototype.remove = methods.remove;
  }
};

/**
 * connections.
 */
var connections = {};

/**
 * create.
 *
 * @param {Object} Modelised defined by Modelis.define.
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
    return connections[option.connection] || (connections[option.connection] = monk(option.connection));
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
      Repository.collection().findAndModify(query, values, function(err, objects) {
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
   * @param {Object} object
   * @param {Function?} callback
   * @return {Object}
   */
  Repository.insert = function(object, callback) {
    callback = _.isFunction(callback) ? callback : _.noop;

    return new Promise(function(resolve, reject) {
      Repository.collection().insert(object, function(err, object) {
        var instance = instantiate(object);

        callback(err, instance);

        if (err) return reject(err);

        resolve(instance);
      });
    });
  };

  /**
   * update document.
   *
   * @param {Object} query
   * @param {Object} update
   * @param {Function?} callback
   * @return {Object}
   */
  Repository.update = function(query, update, callback) {
    callback = _.isFunction(callback) ? callback : _.noop;

    return new Promise(function(resolve, reject) {
      Repository.collection().update(query, update, function(err, count) {
        callback(err, count);

        if (err) return reject(err);

        resolve(count);
      });
    });
  };

  /**
   * remove document.
   *
   * @param {Object} query
   * @param {Function?} callback
   * @return {Object}
   */
  Repository.remove = function(query, callback) {
    callback = _.isFunction(callback) ? callback : _.noop;

    return new Promise(function(resolve, reject) {
      Repository.collection().remove(query, function(err, count) {
        callback(err, count);

        if (err) return reject(err);

        resolve(count);
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

  /**
   * methods.
   *
   * each function`s context is Modelised instance.
   */
  var methods = {};

  /**
   * insert.
   *
   * @param {Function?} callback
   * @return {Object}
   */
  methods.insert = function(callback) {
    callback = _.isFunction(callback) ? callback : _.noop;

    return new Promise(_.bind(function(resolve, reject) {
      Repository.insert(this.toJSON({ _id: Modelised.primaryKey() }), _.bind(function(err, modelised) {
        if (!err) {
          this.merge(modelised.toJSON());
          this.clean();
        }

        callback(err, !!err);

        if (!err) return reject(err);

        resolve(true);
      }, this));
    }, this));
  };

  /**
   * update.
   *
   * @param {Function?} callback
   * @return {Object}
   */
  methods.update = function(callback) {
    callback = _.isFunction(callback) ? callback : _.noop;

    return new Promise(_.bind(function(resolve, reject) {
      Repository.update({ _id: this.primary() }, { $set: this.diff() }, _.bind(function(err, count) {
        var success = !!err && count > 0;
        if (success) this.clean();

        callback(err, success);

        if (!err) return reject(err);

        resolve(success);
      }, this));
    }, this));

  };

  /**
   * remove.
   *
   * @param {Function?} callback
   * @return {Object}
   */
  methods.remove = function(callback) {
    callback = _.isFunction(callback) ? callback : _.noop;

    return new Promise(_.bind(function(resolve, reject) {
      Repository.remove({ _id: this.primary() }, _.bind(function(err, count) {
        var success = !!err && count > 0;
        if (success) this.clean();

        callback(err, success);

        if (!err) return reject(err);

        resolve(success);
      }, this));
    }, this));

  };

  return [Repository, methods];

}

