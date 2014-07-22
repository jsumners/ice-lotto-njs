'use strict';
var async = require('async'),
    dbm = require('db-migrate');
var type = dbm.dataType,
    env = process.env.NODE_ENV || 'production';

exports.up = function(db, callback) {
  console.log('wtf?');
  db.runSql(
    'create table if not exists users (' +
      'id integer primary key, gw2display_name text not null, display_name text,' +
      'email text, password text, time_zone text, datetime_format text,' +
      'claim_key text, claimed integer not null default(0), ' +
      'enabled integer not null default(0)' +
    ')',
    function(err) {
      if (err) {
        console.log('Could not create users table: `%s`', err);
        callback(err);
        return;
      }

      if (env.substr(0, 3) === 'dev') {
        async.series([
          db.runSql.bind(db,
            'insert into users (gw2display_name, email, password, claimed, enabled) ' +
            'values ("Morhyn.8032", "foo@example.com", ' +
            '"$2a$13$2zxivRZhTs0FVel5zkIzsOWH8.7YbSe9vETIcVT3rFiYgcZjx0WbW", ' + // 'password'
            '1, 1)'
          )
        ], callback);
      } else {
        callback();
      }
    }
  );
};

exports.down = function(db, callback) {

};
