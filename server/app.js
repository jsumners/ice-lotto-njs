'use strict';

var config = require('./config'),
    express = require('express'),
    morgan = require('morgan'),
    twig = require('twig');

var app = express(),
    loadRoutes = function(){};

config = config(app.get('env'));
console.dir(config);

// Twig configuration
app.set('view engine', 'twig');
app.set('view options', {layout: false});
app.set('twig options', {});

function main() {
  var server = {};

  loadRoutes();

  server = app.listen(8080, function() {
    console.log('Listening on port %d', server.address().port);
  });
}

loadRoutes = function() {
  require('./routes')(app);
};

app.use(morgan());
main();
