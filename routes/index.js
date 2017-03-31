module.exports = function (opt) {  
  opt.router.get('/', function(req, res) {
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
      res.render('index', results);
    });
  });
  
  opt.router.get('/auth', function(req, res) {
    res.render('auth', { title: 'PartsMart' });
  });
  
  opt.router.post('/touch', function(req, res) {
    var rqb = req.body;
    process.nextTick(() => {
        opt.mail.send(
          rqb.email,
          'PartsMart: Thank You',
          {
            name: rqb.name,
            body: [
              `<strong>Email:</strong> ${rqb.email.trim()}`,
              `<strong>Phone:</strong> ${rqb.phone.trim()}`,
              'You wrote:',
              `<strong>Message:</strong><br> ${rqb.message.trim()}`,
              'Thank you for your email, we will get back to you shortly.'
            ]
          })
          .then(resp => opt.log.info(resp))
          .catch(err => opt.log.error(err));
      });
    res.json({ type: 'success', text: `Hi ${rqb.name.trim()}, thank you for your email, we will get back to you shortly.` });   
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
          .then(resp => opt.log.info(resp))
          .catch(err => opt.log.error(err));
      });
      req.login(user, function signupUserLogin() {
        return res.redirect('/');
      });
    });
  });

  return opt.router;
};
