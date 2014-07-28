'use strict';

var log = require('./logger')();

var sqliteSessionStore = function(sqlite, session) {
  var SqliteStore = function(){},
      db = sqlite,
      Store = session.Store;

  if (sqlite === undefined || sqlite === null || sqlite.toString().indexOf("Database") === -1) {
    throw new Error('Cannot create SqliteSessionStore without sqlite database instance');
  }

  if (session === undefined || session === null || session.toString().indexOf("Session") === -1) {
    throw new Error('Cannot create SqliteSessionStore without Express Session instance');
  }

  SqliteStore = function(options) {
    if (!(this instanceof SqliteStore)) {
      return new SqliteStore(options);
    }

    Store.call(this, options);
  };

  // Inherit from the Express Session object
  SqliteStore.prototype = new Store();

  SqliteStore.prototype.destroy = function (sid, cb) {
    db.run(
      'delete from sessions where id = ?',
      sid,
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

  SqliteStore.prototype.get = function (sid, cb) {
    db.get(
      'select * from sessions where id = ?',
      sid,
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

  SqliteStore.prototype.set = function (sid, sess, cb) {
    // TODO: deal with a expiration time
    var data = JSON.stringify(sess);
    db.run(
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

  return SqliteStore;
};

module.exports = function(sqlite, session) {
  return sqliteSessionStore(sqlite, session);
};