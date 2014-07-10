function hello(req, res) {
  res.render('hello', {name: 'World'});
}

module.exports = function(app) {
  app.get('/hello', hello);
};
