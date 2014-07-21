'use strict';

module.exports = function(env) {
  var fs = require('fs');
  var config = require('./' + env + '.json');

  if (process.env.OPENSHIFT_APP_NAME) {
    // We are running on Red Hat OpenShift.
    // Thus, we need to override some things.
    config.network.ip = process.env.OPENSHIFT_NODEJS_IP;
    config.network.port = process.env.OPENSHIFT_NODEJS_PORT;
    config.dataDir = (function(dataDir) {
      var components = dataDir.split('/'),
          dirName = '';

      if (components.slice(components.length - 1)[0] === '') {
        dirName = components.slice(components.length - 2)[0];
      } else {
        dirName = components.slice(components.length - 1)[0];
      }

      return process.env.OPENSHIFT_DATA_DIR + '/' + dirName + '/';
    }(config.dataDir));
  }

  if (!fs.existsSync(config.dataDir)) {
    fs.mkdirSync(config.dataDir);
  } else if (!fs.statSync(config.dataDir).isDirectory()) {
    fs.mkdirSync(config.dataDir);
  }

  console.log('config => ', config);
  return config;
};
