module.exports = function (opt) {  
  opt.router.get('/', function(req, res) {
    res.render('index', { title: 'PartsMart' });
  });
  
  opt.router.get('/auth', function(req, res) {
    res.render('auth', { title: 'PartsMart' });
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
