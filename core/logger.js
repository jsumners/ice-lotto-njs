'use strict';

var winston = require('winston');

var config = require('../config/logger.json'),
    env = process.env.NODE_ENV || 'production',
    logger;

/**
 * Returns an {@link winston.Logger} instance with transports as configured
 * in the logger.json configuration file.
 *
 * @returns {Logger}
 * @constructor
 */
function Logger() {
  // TODO: clean this up
  var transport,
      transportConfig = config.general,
      transports = [],
      extendConfig = function(){};

  if (!(this instanceof Logger)) {
    return new Logger();
  }

  // Extends the transport options for the environment
  // with the general configuration options. Returns a new
  // object with all options.
  extendConfig = function(options) {
    var obj = options,
        prop;

    for (prop in transportConfig) {
      if (transportConfig.hasOwnProperty(prop)) {
        obj[prop] = transportConfig[prop];
      }
    }

    return obj;
  };

  if (env.substr(0, 3) === "dev") {
    for (transport in config.environments.dev) {
      if (!config.environments.dev.hasOwnProperty(transport)) {
        continue;
      }

      switch (transport) {
        case "console":
          transports.push(
            new winston.transports.Console(
              extendConfig(config.environments.dev[transport])
            )
          );
          break;
        case "file":
          // TODO: create directory and file if it doesn't exist
          transports.push(
            new winston.transports.File(
              extendConfig(config.environments.dev[transport])
            )
          );
          break;
        default:
      }
    }

    this.logger = new winston.Logger({
      transports: transports,
      colorize: config.general.colorize,
      prettyPrint: config.general.prettyPrint,
      timestamp: config.general.timestamp
    });
  }

  if (env.substr(0, 4) === "prod") {
    for (transport in config.environments.prod) {
      if (!config.environments.prod.hasOwnProperty(transport)) {
        continue;
      }

      switch (transport) {
        case "file":
          // TODO: create directory and file if it doesn't exist
          transports.push(
            new winston.transports.File(
              extendConfig(config.environments.prod[transport])
            )
          );
          break;
        default:
      }
    }

    this.logger = new winston.Logger({
      transports: transports
    });
  }
}

Logger.prototype = {
  get logger() {
    return this._logger;
  },
  set logger(logger) {
    this._logger = logger;
  }
};

/**
 * Returns a singleton instance of a {@link Logger}.
 *
 * @returns {Logger}
 */
exports = module.exports = function() {
  if (!logger) {
    logger = new Logger();
  }

  return logger.logger;
};

exports['@singleton'] = true;