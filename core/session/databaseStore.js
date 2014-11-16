'use strict';

var db = {},
    log = function(){},
    session = require('express-session');

var Store = session.Store;

/**
 * Creates a session store that is backed by the application's database.
 *
 * @returns {DatabaseSessionStore}
 * @constructor
 */
function DatabaseSessionStore() {
  if (! (this instanceof DatabaseSessionStore)) {
    return new DatabaseSessionStore();
  }

  Store.call(this, {});
}

// Inherit from the Express Session object
DatabaseSessionStore.prototype = new Store();

DatabaseSessionStore.prototype.destroy = function (sid, cb) {
  db.query(
    'delete from sessions where id = ?',
    [sid],
    function (err) {
      if (err) {
        log.error('Could not delete session with sid = `%s`', sid);
        cb(err);
        return;
      }

      cb();
    }
  );
};

DatabaseSessionStore.prototype.get = function (sid, cb) {
  db.query(
    'select * from sessions where id = ?',
    [sid],
    function (err, row) {
      if (err) {
        log.error('Could not find session with sid = `%s`', sid);
        cb(err);
        return;
      }

      if (row && row.data) {
        cb(null, JSON.parse(row.data));
      } else {
        log.error('Session data missing: `%s`', sid);
        log.debug(row);
        // TODO: figure out how to recreate the session if the store gets wiped
        cb('Missing session');
      }
    }
  );
};

DatabaseSessionStore.prototype.set = function (sid, sess, cb) {
  // TODO: deal with a expiration time
  var data = JSON.stringify(sess);
  db.query(
    'insert or replace into sessions (id, data) values (?, ?)',
    [sid, data],
    function (err) {
      if (err) {
        log.error('Could not store session data for sid = `%s`', sid);
        log.error(err);
        cb(err);
        return;
      }

      if (cb) {
        cb();
      }
    }
  );
};

exports = module.exports = function($database, $logger) {
  db = $database;
  log = $logger;
  return new DatabaseSessionStore();
};

exports['@require'] = [ 'database', 'logger' ];
exports['@singleton'] = true;