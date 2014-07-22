'use strict';
var async = require('async'),
    dbm = require('db-migrate');
var type = dbm.dataType;

exports.up = function(db, callback) {
  async.series([
    db.runSql.bind(db,
      'create table if not exists sessions (id text primary key collate rtrim, data text) without rowid'
    ),
    db.runSql.bind(db,
      'create index if not exists sessions_idx on sessions (id)'
    ),
    db.runSql.bind(db,
      'create table if not exists settings (id integer primary key, name text, data text)'
    ),
    db.runSql.bind(db,
      'create index if not exists settings_idx on settings (name)'
    )
  ], callback);
};

exports.down = function(db, callback) {

};
