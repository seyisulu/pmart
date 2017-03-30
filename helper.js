module.exports = function (db, SHA256) {
  var allowCORS = function (req, res, next) {
    res.header('Access-Control-Allow-Credentials', true);
    res.header('Access-Control-Allow-Origin', 'http://'+host);
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept');
    if (req.isAuthenticated()) {
      return res.redirect('/'); // /dashboard
    } else {
      return next();
    }
    return 'OPTIONS' === req.method? res.send(200): next();
  };

  var debugMiddle = function (req, res, next) {
    next();
  };

  var ensureNoAuth = function (req, res, next) {
    return req.isAuthenticated() && !req.user.guest? res.redirect('/'): next(); // /dashboard
  };

  var ensureAuth = function (req, res, next) {
    return req.isAuthenticated()? next(): res.redirect('/auth');
  };

  var ensureAdmin = function (req, res, next) {
    var err = new Error('Forbidden');
    err.status = 403;
    return req.isAuthenticated() && req.user.admin? next(): next(err);
  };

  var enforceUser = function (req, res, next) {
    if (!req.isAuthenticated()) {
      var rnd = Math.random().toString().split('.')[1],
          user = new db.User({
            profile: { fname: 'J. Random', lname: 'User', phone: '0' + rnd.substr(0, 10) },
            email: rnd + '@pm.com',
            salt: rnd,
            password: SHA256(Date.now() + rnd)
          });
      user.save();
      req.login(user, next);
      return;
    } else {
      return next();
    }
  };

  return {
    allowCORS: allowCORS,
    debugMiddle: debugMiddle,
    ensureAdmin: ensureAdmin,
    ensureAuth: ensureAuth,
    ensureNoAuth: ensureNoAuth,
    enforceUser: enforceUser
  };
};
