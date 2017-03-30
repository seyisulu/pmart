require('dotenv').config();

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var chalk = require('chalk');
var SHA256 = require('crypto-js/sha256');
var _ = require('lodash');
var flash = require('connect-flash');
var mail = require('./mail')({ sendgrid: require('sendgrid')(process.env.SG_KEY), jade: require('jade') });

var passport = require('passport');
var Strategy = require('passport-local').Strategy;
var session = require('express-session');

var MongoStore = require('connect-mongo/es5')(session);
var asynx = require('async');
    
mongoose.Promise = global.Promise;

var app = express();
var pro = app.get('env') !== 'development'? true: false;
var log = require('./log')({ chalk: chalk });
var dbo = require('./dbo')({ mongoose: mongoose, log: log, SHA256: SHA256 });
var helpers = require('./helper')(dbo, SHA256);
var routeOpts = { dbo: dbo, hs: helpers, log: log, router: express.Router(), SHA256: SHA256, asynx: asynx, mail: mail, passport: passport };

String.prototype.toObjectId = function() {
  var ObjectId = mongoose.Types.ObjectId;
  return new ObjectId(this.toString());
};

String.prototype.toTitleCase = function() {
  return this.toString().replace(/\w\S*/g, function(txt){
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
};

passport.use('local-signin', new Strategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true,
    session: true
  },
  function(req, email, password, done) {
    var msg;
    dbo.User
    .findOne({ email: email })
    .select('_id email password salt fname lname phone admin')
    .exec(function(err, user) {
      if (err) { return done(err); }
      if (!user) {
        msg = `"${email}" has not been registered.`;
        return done(null, false, req.flash('signinMessage', msg)); }
      if (!user.verifyPassword(psswd)) {
        msg = `Incorrect password for "${email}".`;
        return done(null, false, req.flash('signinMessage', msg)); }
      process.nextTick(() => {
        dbo.User.update({ email: email }, { $set: { lastseen: Date.now() } }).exec();
      });
      return done(null, user);
    });
  }
));
passport.serializeUser(function(user, cb) {
  cb(null, user._id);
});
passport.deserializeUser(function(id, cb) {
  dbo.User
  .findOne({ _id: id })
  .select('_id email password salt fname lname phone admin')
  //.populate('requests')
  .exec(function(err, user) { cb(err, user); });
});

var index = require('./routes/index')(routeOpts);
var users = require('./routes/users')(routeOpts);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.set('view cache', pro);

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    secret: 'antitopetimilehin-kiniburuku3gbeseyin',
    store: new MongoStore({
      mongooseConnection: mongoose.connection,
      ttl: 7 * 24 * 60 * 60 // = 7 days
    }),
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(function (req, res, next){
  res.locals.user = req.user;
  next();
});

app.use('/', index);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
