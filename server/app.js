'use strict';

var config = require('./config'),
    express = require('express'),
    morgan = require('morgan');
var app = express(),
    loadRoutes = function(){};

config = config(app.get('env'));
console.dir(config);

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
