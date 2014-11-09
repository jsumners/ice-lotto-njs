'use strict';

exports = module.exports = function() {
  var env = process.env.NODE_ENV || 'development',
      settings = require('../config/' + env + '.json'),
      fs = require('fs');

  if (process.env.OPENSHIFT_APP_NAME) {
    // We are running on Red Hat OpenShift.
    // Thus, we need to override some things.
    settings.network.ip = process.env.OPENSHIFT_NODEJS_IP;
    settings.network.port = process.env.OPENSHIFT_NODEJS_PORT;
    settings.dataDir = (function(dataDir) {
      var components = dataDir.split('/'),
          dirName = '';

      if (components.slice(components.length - 1)[0] === '') {
        dirName = components.slice(components.length - 2)[0];
      } else {
        dirName = components.slice(components.length - 1)[0];
      }

      return process.env.OPENSHIFT_DATA_DIR + '/' + dirName + '/';
    }(settings.dataDir));
  }

  if (!fs.existsSync(settings.dataDir)) {
    fs.mkdirSync(settings.dataDir);
  } else if (!fs.statSync(settings.dataDir).isDirectory()) {
    fs.mkdirSync(settings.dataDir);
  }

  return settings;
};

exports['@singleton'] = true;