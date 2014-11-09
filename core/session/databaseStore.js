'use strict';

var log = {},
    session = require('express-session');

function DatabaseSessionStore(db) {
  var DatabaseStore = function(){},
      Store = session.Store;

  if (! (this instanceof DatabaseSessionStore)) {
    return new DatabaseSessionStore(db);
  }

  DatabaseStore = function() {
    if (!(this instanceof DatabaseStore)) {
      return new DatabaseStore();
    }

    Store.call(this, {});
  };

  // Inherit from the Express Session object
  DatabaseStore.prototype = new Store();

  DatabaseStore.prototype.destroy = function (sid, cb) {
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

  DatabaseStore.prototype.get = function (sid, cb) {
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

  DatabaseStore.prototype.set = function (sid, sess, cb) {
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

  return DatabaseStore;
};

exports = module.exports = function(db, logger) {
  log = logger;
  return new DatabaseSessionStore(db);
};

exports['@require'] = [ 'database', 'logger' ];
exports['@singleton'] = true;