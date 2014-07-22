'use strict';

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
  var passport = app.get('passport');
  if (!passport) {
    throw new Error('Passport must be added to app with app.set()!');
  }

  app.get('/login', login);
  app.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login'
  }));
  app.get('/logout', logout);
};
