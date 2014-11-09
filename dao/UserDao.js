'use strict';

var log = {};

function UserDao(db, user) {
  if (!(this instanceof UserDao)) {
    return new UserDao(db);
  }

  this.self = this;
  this.db = db;

  this.self.buildUser = function(row) {
    var user = new User();
    user.id = row.id;
    user.gw2DisplayName = row.gw2display_name;
    user.displayName = row.display_name;
    user.email = row.email;
    user.password = row.password; // TODO: do we really want this property?
    user.timeZone = row.time_zone;
    user.datetimeFormat = row.datetime_format;
    user.claimKey = row.claim_key;
    user.claimed = (row.claimed === 0) ? false : true;
    user.enabled = (row.enabled === 0) ? false : true;

    return user;
  };
}

UserDao.prototype = {
  get self() {
    return this._self;
  },
  set self(self) {
    this._self = self;
  },

  get db() {
    return this._db;
  },
  set db(db) {
    this._db = db;
  }
};

/**
 * This callback is invoked when a `findOne` lookup has completed.
 * @callback findOneCallback
 * @param {string|null} If set, there was an error retrieving the user.
 * @param {User|undefined} A {@link User} object on success, otherwise `undefined`.
 */

/**
 * Retrieves a user from the database identified by their Guild Wars 2
 * display name.
 *
 * @param {string} gw2DisplayName The user's Guild Wars 2 display name (e.g. 'Morhyn.8032').
 * @param {findOneCallback} callback Function to be invoked when the user is
 * retrieved.
 */
UserDao.prototype.findOneByGw2DisplayName = function(gw2DisplayName, callback) {
  log.debug('UserDao#findOneByGw2DisplayName => ', gw2DisplayName);
  var self = this.self;

  this.db.query(
    'select * from users where gw2display_name = ?',
    [gw2DisplayName],
    function(err, results) {
      if (err || results.rows.length === 0) {
        callback(err);
        return;
      }

      callback(null, self.buildUser(results.rows[0]));
    }
  );
};

/**
 * Retrieves a user from the database identified by their local identifier.
 *
 * @param {integer} id The database identifier for the user.
 * @param {findOneCallback} callback Function to be invoked when the user is
 * retrieved.
 */
UserDao.prototype.findOneById = function(id, callback) {
  log.debug('UserDao#findOneById => ', id);
  var self = this.self;

  this.db.query(
    'select * from users where id = ?',
    [id],
    function(err, results) {
      if (err || results.rows.length === 0) {
        callback(err);
        return;
      }

      callback(null, self.buildUser(results.rows[0]));
    }
  );
};

/**
 * Returns a singleton instance of {@link UserDao}.
 *
 * @param {Sqlite3} sqlite An instance of {@link Sqlite3} for retrieving data.
 * @returns {UserDao}
 */
exports = module.exports = function(db, logger, user) {
  log = logger;
  return new UserDao(db, user);
};

exports['@require'] = ['database', 'logger', 'models/user' ];