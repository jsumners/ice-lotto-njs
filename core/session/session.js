'use strict';

var log = {};

function localSession(sessionOptions, databaseStore) {
  function LocalSession() {
    this.init = function (cb) {
      log.debug('Initializing LocalSession object');
      var session = require('express-session');

      sessionOptions(function (options) {
        log.debug('Session options retrieved, creating session object');
        var _session = session(options);
        _session.Store = databaseStore;

        cb(_session);
      });
    };
  }

  return LocalSession;
}

exports = module.exports = function(sessionOptions, databaseStore, logger) {
  log = logger;
  return localSession(sessionOptions, databaseStore);
};

exports['@require'] = [ 'session/options', 'session/databaseStore', 'logger' ];
exports['@singleton'] = true;