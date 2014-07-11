'use strict';

var config = require('./config'),
    express = require('express'),
    morgan = require('morgan'),
    sqlite3 = require('sqlite3'),
    twig = require('twig');

var app = express(),
    loadRoutes = function(){},
    setupViewConfig = function(){};

function main() {
  var server = {};

  setupViewConfig();
  loadRoutes();

  app.use(morgan()); // Basically equivalent to Apache HTTPD's access.log
  server = app.listen(8080, function() {
    console.log('Listening on port %d', server.address().port);
  });
}

loadRoutes = function() {
  require('./routes')(app);
};

setupViewConfig = function() {
  // Twig configuration
  app.set('view engine', 'twig');
  app.set('view options', {layout: false});
  app.set('twig options', {});
};

// Run some blocking operations and then do the main setup and launching
config = config(app.get('env'));
app.set('db', new sqlite3.Database(config.db.file));
main();
