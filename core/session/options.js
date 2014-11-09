'use strict';

var log = {};

function sessionOptions(db, settings) {
  var options = settings.session;

  function _sessionOptions(cb) {
    log.debug('Querying for session key');
    db.query(
      'select data from settings where name = "session-key"',
      function (err, results) {
        log.debug('Session key fetched ... ', results);
        if (err) {
          log.error('Could not read settings from database!');
          log.error(err);
        }

        var generateKey = true;
        if (results !== undefined && results.rows.length > 0) {
          options.secret = results.rows[0].data;
          generateKey = false;
        }

        // We didn't find a secret in the database so we need to create one
        if (generateKey) {
          log.debug('Creating new secret key');
          var crypto = require('crypto'),
            keyBuffer = crypto.randomBytes(48);

          options.secret = keyBuffer.toString('hex');
          log.debug('Saving new secret key to database');
          db.query(
            'insert or replace into settings (name, data) values ("session-key", ?)',
            [options.secret]
          );
        }

        cb(options);
      }
    );
  }

  return _sessionOptions;
}

exports = module.exports = function(db, logger, settings) {
  log = logger;
  return sessionOptions(db, settings);
};

exports['@require'] = [ 'database', 'logger', 'settings' ];
exports['@singleton'] = true;