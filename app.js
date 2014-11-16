'use strict';

// Third-party imports
var ioc = require('electrolyte'),
    express = require('express'),
    bodyParser = require('body-parser'),
    morgan = require('morgan'),
    path = require('path'),
    twig = require('twig');

// Configure the DI container with imports in processing order
ioc.loader('', ioc.node('core')); // Core imports
ioc.loader('models', ioc.node('models'));
ioc.loader('dao', ioc.node('dao'));

// Local imports
var config = ioc.create('settings'),
    log = ioc.create('logger');

log.info('Application starting ...');
var app = express();

function startServer() {
  var server = {};
  setupViewConfig();

  log.debug('Loading routes ...');
  require('./routes')(app);

  log.info('Starting web server ...');
  server = app.listen(
    config.network.port,
    config.network.ip,
    function listeningCallback() {
      log.info('Server URI = http://%s:%d', server.address().address, server.address().port);
    }
  );
}

function setupViewConfig() {
  log.debug('Configuring view module ...');
  // Twig configuration
  app.set('view engine', 'twig');
  app.set('view options', {layout: false});
  app.set('twig options', {});
}

function setupPassport(cb) {
  log.debug('Configuring passport ...');
  //http://passportjs.org/guide/configure/
  var authenticator = ioc.create('authenticator'),
      userDao = ioc.create('dao/UserDao'),
      localSession = ioc.create('session/session'),
      passport = require('passport'),
      LocalStrategy = require('passport-local').Strategy;

  passport.use(new LocalStrategy(
    function strategyAuthenticator(username, password, done) {
      authenticator.validate(username, password, function(err, user) {
        if (err) {
          done(null, false, {message: err});
          return;
        }

        done(null, user);
      });
    }
  ));

  passport.serializeUser(function userSerializer(id, done) {
    done(null, id);
  });

  passport.deserializeUser(function userDeserializer(id, done) {
    userDao.findOneById(id, done);
  });

  localSession.init(function sessionInitCallback(session) {
    log.debug('Adding passport to express server');
    app.use(session);
    app.use(passport.initialize());
    app.use(passport.session());
    app.set('passport', passport);

    cb();
  });
}

log.debug('config => ', config);

// Static resources should be served before we start hitting the database
// or any other type of dynamic routes.
var staticRouter = ioc.create('staticRouter');
staticRouter.addRoute('/public');
staticRouter.addNodeRoute('/bootstrap', 'bootstrap/dist');
staticRouter.addNodeRoute('/jquery', 'jquery/dist');
app.use(staticRouter);

// Enable request logging of non-static resources
app.use(morgan('combined')); // Basically equivalent to Apache HTTPD's access.log

// Requests are passed through the app.use stuff in order. So we need to parse
// any message bodies before we try to do anything with them.
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json({}));

// Now we configure Passport so it can be used to authenticate any requests
// beyond this point.
setupPassport(startServer);