module.exports = function (opt) {
  opt.router.get('/', function(req, res) {
    res.send('respond with a resource');
  });

  return opt.router;
};
