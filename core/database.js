'use strict';

exports = module.exports = function(settings) {
  var anyDB = require('any-db'),
      database = anyDB.createPool(settings.db.url, settings.db.poolOptions);

  return database;
};

exports['@require'] = [ 'settings' ];
exports['@singleton'] = true;