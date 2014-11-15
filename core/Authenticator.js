'use strict';

var bcrypt = require('bcrypt');

var db = {},
    log = function(){};

function Authenticator() {
  if (!(this instanceof Authenticator)) {
    return new Authenticator();
  }
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
Authenticator.prototype.validate = function(username, password, callback) {
  db.query(
    'select id, password from users where gw2display_name = ?',
    [username],
    function(err, results) {
      if (err) {
        log.error('Could not validate user');
        log.debug(err);
        callback(err);
        return;
      }

      if (results.rows.length === 0) {
        log.error('User not in database: ', username);
        callback('Credentials do not match'); // user doesn't exist
        return;
      }

      if (!bcrypt.compareSync(password, results.rows[0].password)) {
        log.error('Invalid credentials');
        callback('Credentials do not match');
      } else {
        log.debug('Credentials match');
        callback(null, results.rows[0].id);
      }
    }
  );
};

/**
 * Used to encrypte a string into a database storable value.
 *
 * @param {string} password The password to encrypt
 * @returns {string} The password hash
 */
Authenticator.prototype.encryptPassword = function(password) {
  var salt = bcrypt.genSaltSync(13);
  return bcrypt.hashSync(password, salt);
};

exports = module.exports = function($database, $logger) {
  db = $database;
  log = $logger;
  return new Authenticator();
};

exports['@require'] = [ 'database', 'logger' ];
exports['@singleton'] = true;