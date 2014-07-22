'use strict';

// Third-party imports
var express = require('express'),
    session = require('express-session'),
    bodyParser = require('body-parser'),
    morgan = require('morgan'),
    sqlite3 = require('sqlite3'),
    passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    session = require('express-session'),
    path = require('path'),
    twig = require('twig');

// Local imports
var Authenticator = require('./core/Authenticator'),
    config = require('./config');

// Local variables
var app = express(),
    dependencies = {},
    loadRoutes = function(){},
    setupViewConfig = function(){},
    setupPassport = function(){};

function main() {
  var server = {};

  // Requests are passed through the app.use stuff in order. So we need to parse
  // any message bodies before we try to do anything with them.
  // parse application/x-www-form-urlencoded
  app.use(bodyParser.urlencoded({ extended: false }));
  // parse application/json
  app.use(bodyParser.json());

  setupViewConfig();
  loadRoutes();

  app.use(morgan()); // Basically equivalent to Apache HTTPD's access.log

  app.use(express.static(path.join(__dirname, 'public')));
  app.use('/bootstrap', express.static(path.join(__dirname, 'node_modules', 'bootstrap', 'dist')));
  app.use('/jquery', express.static(path.join(__dirname, 'node_modules', 'jquery', 'dist')));

  server = app.listen(
    dependencies.config.network.port,
    dependencies.config.network.ip,
    function() {
      console.log('Server URI = http://%s:%d', server.address().address, server.address().port);
    }
  );
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

setupPassport = function(sessionConfig) {
  //http://passportjs.org/guide/configure/

  passport.use(new LocalStrategy(
    function(username, password, done){
      var authenticator = new Authenticator(dependencies.sqlite),
          user = {id: 1, username: username};

      authenticator.validate(username, password, function(err) {
        if (err) {
          done(null, false, {message: err});
          return;
        }

        done(null, user);
      });
    }
  ));

  passport.serializeUser(function (user, done) {
    console.log('-----------------serialize');
    done(null, user.id);
  });

  passport.deserializeUser(function (id, done) {
    console.log('-----------------deserialize');
    // TODO: find user from id
    var user = {id: 1, username: 'user'};
    done(null, user);
  });

  app.use(session(sessionConfig));
  app.use(passport.initialize());
  app.use(passport.session());
  app.set('passport', passport);
};

// Run some blocking operations and then do the main setup and launching
dependencies.config = config(app.get('env'));
dependencies.sqlite = new sqlite3.Database(dependencies.config.db.file);
dependencies.sqlite.get(
  // We'll be configuring express-session and password here.
  // Once those essentials are configured main() is called and the app will
  // be running.
  'select data from settings where name = "session-key"',
  function(err, row) {
    if (err) {
      console.log('Could not read settings from database!');
      console.log(err);
      process.exit(1);
    }

    var options = dependencies.config.session,
        SqliteSessionStore = require('./core/SqliteSessionStore')(dependencies.sqlite, session);
    (function() {
      if (row !== undefined && row.data) {
        options.secret = row.data;
        return;
      }

      var crypto = require('crypto'),
          keyBuffer = crypto.randomBytes(48);

      options.secret = keyBuffer.toString('hex');
    }());

    options.store = new SqliteSessionStore(options);

    setupPassport(options);
    main();
  }
);
