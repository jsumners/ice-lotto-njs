'use strict';
var passport = require('passport');

function login(req, res) {
  if (req.user) {
    res.redirect('/');
  }
  res.render('login');
}

function logout(req, res) {
  req.logout();
  res.redirect('/');
}

module.exports = function(app) {
  app.get('/login', login);
  app.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login'
  }));
  app.get('/logout', logout);
};
