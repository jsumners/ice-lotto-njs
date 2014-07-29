'use strict';

// A hack so that we can require modules from the root
// of the application instead of using relative paths.
// https://gist.github.com/branneman/8048520
global.rootRequire = function(name) {
    return require(__dirname + '/' + name);
};

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
var Authenticator = rootRequire('core/Authenticator'),
    config = require('./config'),
    log = rootRequire('core/logger')();

// Local variables
var app = express(),
    dependencies = {},
    sessionOptions = {},
    addDependencies = function(){},
    loadRoutes = function(){},
    setupViewConfig = function(){},
    setupPassport = function(){};

log.info('Application starting ...');

function main() {
  log.debug('Entering main ...');
  log.debug('config => ', dependencies.config);
  var server = {};

  // Setup our remaining local dependencies.
  addDependencies();

  app.use(morgan('combined')); // Basically equivalent to Apache HTTPD's access.log

  // Static resources should be served before we start hitting the database
  // or any other type of dynamic routes.
  // TODO: look at using another router specifically for static resources and maybe one for static admin (authed) resources
  app.use(express.static(path.join(__dirname, 'public')));
  app.use('/bootstrap', express.static(path.join(__dirname, 'node_modules', 'bootstrap', 'dist')));
  app.use('/jquery', express.static(path.join(__dirname, 'node_modules', 'jquery', 'dist')));

  // Requests are passed through the app.use stuff in order. So we need to parse
  // any message bodies before we try to do anything with them.
  // parse application/x-www-form-urlencoded
  app.use(bodyParser.urlencoded({ extended: false }));
  // parse application/json
  app.use(bodyParser.json());

  // Now we configure Passport so it can be used to authenticate any requests
  // beyond this point.
  setupPassport(sessionOptions);

  setupViewConfig();
  loadRoutes();

  log.info('Starting web server ...');
  server = app.listen(
    dependencies.config.network.port,
    dependencies.config.network.ip,
    function() {
      log.info('Server URI = http://%s:%d', server.address().address, server.address().port);
    }
  );
}

addDependencies = function() {
  log.debug('Adding remaining dependencies ...');
  var userDao = require('./dao/UserDao')(dependencies.sqlite);

  dependencies.userDao = userDao;
};

loadRoutes = function() {
  log.debug('Loading routes ...');
  require('./routes')(app);
};

setupViewConfig = function() {
  log.debug('Configuring view module ...');
  // Twig configuration
  app.set('view engine', 'twig');
  app.set('view options', {layout: false});
  app.set('twig options', {});
};

setupPassport = function(sessionConfig) {
  log.debug('Configuring passport ...');
  //http://passportjs.org/guide/configure/
  var authenticator = new Authenticator(dependencies.sqlite);

  passport.use(new LocalStrategy(
    function(username, password, done){
      authenticator.validate(username, password, function(err, user) {
        if (err) {
          done(null, false, {message: err});
          return;
        }

        done(null, user);
      });
    }
  ));

  passport.serializeUser(function (id, done) {
    done(null, id);
  });

  passport.deserializeUser(function (id, done) {
    dependencies.userDao.findOneById(id, done);
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
    log.debug('Session key fetched ... ', row);
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
          keyBuffer = crypto.randomBytes(48),
          stmt = dependencies.sqlite.prepare(
            'insert or replace into settings (name, data) values ("session-key", ?)'
          );

      options.secret = keyBuffer.toString('hex');
      stmt.run(options.secret);
    }());

    options.store = new SqliteSessionStore(options);
    sessionOptions = options;

    main();
  }
);
