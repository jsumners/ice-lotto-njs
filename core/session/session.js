'use strict';

var log = function(){},
    databaseStore = {},
    sessionOptions = {};

/**
 * Creates a session manager that uses the application database to store
 * sessions. You must call the {@link LocalSession#init} method after creating
 * an instance of <code>LocalSession</code>.
 *
 * @returns {LocalSession}
 * @constructor
 */
function LocalSession() {
  if (! (this instanceof LocalSession)) {
    return new LocalSession();
  }
}

LocalSession.prototype = {
  get initialized() {
    return this._initialized;
  },
  set initialized(initialized) {
    this._initialized = initialized;
  }
};

/**
 * This callback is invoked when {@link LocalSession#init} has completed.
 *
 * @callback LocalSessionInitCallback
 * @param {object} session The initialized session manager
 */

/**
 * Used to initialize the session manager. Once initialization is complete,
 * the callback will be invoked with the configured session manager
 * as the sole parameter.
 *
 * @param {LocalSessionInitCallback} cb
 */
LocalSession.prototype.init = function(cb) {
  if (this.initialized) {
    return;
  }

  log.debug('Initializing LocalSession object');
  var session = require('express-session');
  var self = this;

  sessionOptions(function (options) {
    log.debug('Session options retrieved, creating session object');
    var _session = session(options);
    _session.Store = databaseStore;

    self.initialized = true;
    cb(_session);
  });
};

exports = module.exports = function($sessionOptions, $databaseStore, $logger) {
  log = $logger;
  databaseStore = $databaseStore;
  sessionOptions = $sessionOptions;

  return new LocalSession();
};

exports['@require'] = [ 'session/options', 'session/databaseStore', 'logger' ];
exports['@singleton'] = true;