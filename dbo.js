module.exports = function (opt) {
  opt.mongoose
  .connect(process.env.DB_URL, { db: { safe: { w: 1, journal: true, wtimeout: 10000 } }, config: { autoIndex: true } });
  opt.mongoose.connection.on('error', function mongooseConnected() {
    opt.log.error('Mongoose connection error: plese verify that mongod is running');
    //opt.log.error(error);
  });
  opt.mongoose.connection.once('open', function mongooseOpened() {
    opt.log.info('Mongoose connected to the database');
  });

  var dbo = {
    User: require('./models/user')({ mongoose: opt.mongoose, log: opt.log }),
    Car: require('./models/car')({ mongoose: opt.mongoose, log: opt.log })
  };
  
  opt.mongoose.connection.on('connected', function () {
    dbo.Car.collection.count(function(err, count) {
      if( 0 === count ) {
        opt.log.log('No cars found! Seeding data.');
        dbo.Car.collection.insert(require('./models/cars'), function (err) {
          if (err) opt.log.error('Error seeding car data: ', err);
          else {
            opt.log.info('Successfully seeded country data');
            dbo.User.collection.count(function(err, count) {
              if( 0 === count ) {
                opt.log.log('No users found');
                var rnd = Math.random().toString().split('.')[1],
                    usr = {
                      fname: 'Admin',
                      lname: 'Admin',
                      phone: '08055146000',
                      email: 'eolowo@live.com',
                      password: opt.SHA256('passme88' + rnd).toString(),
                      salt: rnd,
                      admin: true
                    };
                dbo.User.collection.insert(usr, function (err) {
                  if (err) opt.log.error('Error seeding admin data');
                  else opt.log.info('Successfully seeded admin data');
                });
              } else opt.log.log(count + ' users available');
            });
          }
        });
      } else opt.log.log(count + ' cars available');
    });
  });

  return dbo;
};
