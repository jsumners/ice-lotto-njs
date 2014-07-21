module.exports = function(env) {
  var config = require('./' + env + '.json');

  if (process.env.OPENSHIFT_APP_NAME) {
    // We are running on Red Hat OpenShift.
    // Thus, we need to override some things.
    config.network.ip = process.env.OPENSHIFT_NODEJS_IP;
    config.network.port = process.env.OPENSHIFT_NODEJS_PORT;
  }

  console.log('config => ', config);
  return config;
};
