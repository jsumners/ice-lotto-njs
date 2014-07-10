var dbm = require('db-migrate');
var type = dbm.dataType;

exports.up = function(db, callback) {
    db.runSql(
      'create table if not exists sessions (id text primary key collate rtrim, data text) without rowid',
      function(err) {
        if (err) {
          console.log('Could not create sessions table: `%s`', err);
          callback(err);
          return;
        }

        db.runSql(
          'create index if not exists sessions_idx on sessions (id)',
          function(err) {
            if (err) {
              console.log('Could not create sessions index: `%s', err);
              callback(err);
              return;
            }
          }
        );
      }
    );
};

exports.down = function(db, callback) {

};
