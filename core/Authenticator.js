'use strict';

var Authenticator = function(db) {
  var bcrypt = require('bcrypt');
  var self = this,
      obj = {};

  if (!(this instanceof Authenticator)) {
    return new Authenticator(db);
  }

  /**
   * This callback is called after password verification is complete. It accepts
   * one parameter, and that parameter is an error parameter. If the callback
   * is called with any value other than `null` then there was a problem with
   * the verification and it failed.
   *
   * @callback validateCallback
   * @param {string=} error A message detailing what went wrong
   */

  /**
   * Validates a set of credentials against the database. Once validation is
   * complete, the callback method will be invoked with the result.
   *
   * @param {string} username The Guild Wars 2 display name to lookup (e.g. 'Morhyn.8032')
   * @param {string} password The plain text password to verify
   * @param {validateCallback} callback Function to call when validation is complete
   */
  obj.validate = function(username, password, callback) {
    db.query(
      'select id, password from users where gw2display_name = ?',
      [username],
      function(err, results) {
        if (err) {
          callback(err);
          return;
        }
        if (results.rows.length === 0) {
          callback('Credentials do not match'); // user doesn't exist
          return;
        }

        if (!bcrypt.compareSync(password, results.rows[0].password)) {
          callback('Credentials do not match');
        } else {
          callback(null, results.rows[0].id);
        }
      }
    );
  };

  obj.encryptPassword = function(password) {
    var salt = bcrypt.genSaltSync(13);
    return bcrypt.hashSync(password, salt);
  };

  return obj;
};

exports = module.exports = function(db) {
  return new Authenticator(db);
};

exports['@require'] = [ 'database' ];
exports['@singleton'] = true;