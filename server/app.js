'use strict';

var config = require('./config'),
    express = require('express'),
    morgan = require('morgan'),
    sqlite3 = require('sqlite3'),
    passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    session = require('express-session'),
    path = require('path'),
    twig = require('twig');

var app = express(),
    loadRoutes = function(){},
    setupViewConfig = function(){},
    setupPassport = function(){};

function main() {
  var server = {};

  setupViewConfig();
  loadRoutes();
  setupPassport();

  app.use(morgan()); // Basically equivalent to Apache HTTPD's access.log

  app.use(express.static(path.join(__dirname, 'public')));
  app.use('/bootstrap', express.static(path.join(__dirname, 'node_modules', 'bootstrap', 'dist')));
  app.use('/jquery', express.static(path.join(__dirname, 'node_modules', 'jquery', 'dist')));

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

setupPassport = function() {
  //http://passportjs.org/guide/configure/
  app.use(session(config.session));
  app.use(passport.initialize());
  app.use(passport.session());
  passport.use(new LocalStrategy(
    function(username, password, done){
      // TODO: Find user in database and verify password
      var user = {id: 1, username: username};
      if (!user) { // || !verifyPassword(user, password)
        done(null, false, {message: 'Incorrect Credentials'});
        return;
      }
      done(null, user);
    }
  ));

  passport.serializeUser(function (user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function (id, done) {
    // TODO: find user from id
    var user = {id: 1, username: 'user'};
    done(null, user);
  })
};

// Run some blocking operations and then do the main setup and launching
config = config(app.get('env'));
app.set('db', new sqlite3.Database(config.db.file));
main();
