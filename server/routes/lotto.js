function overview(req, res) {
  res.render('lotto/overview');
}

module.exports = function(app) {
  app.get('/', overview);

};