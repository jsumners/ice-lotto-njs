'use strict';
var fs = require('fs'),
    path = require('path');

module.exports = function(app) {
  fs.readdirSync('./routes').forEach(function(file) {
    // We shouldn't read in ourselves
    if (file === path.basename(__filename)) { return; }

    // Load a route file
    require ('./' + file)(app);
  });
};
