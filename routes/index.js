module.exports = function (opt) {  
  opt.router.get('/', function(req, res) {
    res.render('index', { title: 'PartsMart' });
  });
  
  opt.router.get('/auth', function(req, res) {
    res.render('auth', { title: 'PartsMart' });
  });
  
  opt.router.get('/search', function(req, res) {
    opt.asynx.parallel({
      makes: function(cb) {
        opt.dbo.Car
        .find({ })
        .distinct('make')
        .exec(function(err, doc) {
          if (err) opt.log.error('Error fetching cars');
          cb(err, doc);
        });
      }
    }, function(err, results) {
      res.render('search', results);
    });    
  });
  
  opt.router.post('/search', function(req, res) {
    opt.asynx.parallel({
      makes: function(cb) {
        opt.dbo.Car
        .find({ })
        .distinct('make')
        .exec(function(err, doc) {
          if (err) opt.log.error('Error fetching cars');
          cb(err, doc);
        });
      },
      search: function(cb) {
        opt.dbo.Car
        .find({ make: req.body.make, model: req.body.model, year: req.body.year })
        .exec(function(err, doc) {
          if (err) opt.log.error('Error fetching cars');
          cb(err, doc);
        });
      }
    }, function(err, results) {
      res.render('search', results);
    });    
  });
  
  opt.router.post('/model', function(req, res) {
    opt.asynx.parallel({
      models: function(cb) {
        opt.dbo.Car
        .find({ make: req.body.make })
        .distinct('model')
        .exec(function(err, doc) {
          if (err) opt.log.error('Error fetching models');
          cb(err, doc);
        });
      }
    }, function(err, results) {
      res.json(results);
    });    
  });
  
  opt.router.post('/year', function(req, res) {
    opt.asynx.parallel({
      years: function(cb) {
        opt.dbo.Car
        .find({ make: req.body.make, model: req.body.model })
        .distinct('year')
        .exec(function(err, doc) {
          if (err) opt.log.error('Error fetching years');
          cb(err, doc);
        });
      }
    }, function(err, results) {
      res.json(results);
    });    
  });
  
  opt.router.post('/signin', opt.passport.authenticate('local-signin', {
      successRedirect: '/', // dashboard
      failureRedirect: '/auth',
      passReqToCallback: true,
      failureFlash: true }));
  
  opt.router.post('/signup', opt.hs.ensureNoAuth, function userSignupGet(req, res) {
    var rqb = req.body,
        slt = Math.random().toString().split('.')[1],
        pss = opt.SHA256(rqb.password + slt),
        user = new opt.dbo.User({
          email: rqb.email, password: pss.toString(), salt: slt, 
          fname: rqb.fname, lname: rqb.lname, phone: rqb.phone
        });
    user.save(function signupUserSave(err, user) {
      if (err) {
        opt.log.log('Error signing up user');
        return res.redirect('/auth');
      }
      process.nextTick(() => {
        opt.mail.send(
          rqb.email,
          'Welcome to PartsMart',
          {
            name: rqb.fname,
            body: [
              'Welcome aboard!',
              'We hope you love it here.',
              'Please sign in <a href="http://pmart.jupeb.edu.ng/auth">here</a>'
            ]
          })
          .then(resp => res.json(resp))
          .catch(err => res.json(err));
      });
      req.login(user, function signupUserLogin() {
        return res.redirect('/');
      });
    });
  });

  return opt.router;
};
