module.exports = function (opt) {  

  opt.router.get('/make', function apiGetMake(req, res) {
    opt.asynx.parallel({
      data: function(cb) {
        opt.dbo.Car
        .find({ })
        .distinct('make')
        .exec(function(err, doc) {
          if (err) opt.log.error('Error fetching cars');
          cb(err, doc);
        });
      }
    }, function(err, results) {
      res.json(results.data);
    });    
  });
  
  opt.router.get('/make/:make/model', function(req, res) {
    opt.asynx.parallel({
      models: function(cb) {
        opt.dbo.Car
        .find({ make: req.params.make })
        .distinct('model')
        .exec(function(err, doc) {
          if (err) opt.log.error('Error fetching models');
          cb(err, doc);
        });
      }
    }, function(err, results) {
      res.json(results.models);
    });    
  });
  
  opt.router.get('/make/:make/model/:model/year', function(req, res) {
    opt.asynx.parallel({
      years: function(cb) {
        opt.dbo.Car
        .find({ make: req.params.make, model: req.params.model })
        .distinct('year')
        .exec(function(err, doc) {
          if (err) opt.log.error('Error fetching years');
          cb(err, doc);
        });
      }
    }, function(err, results) {
      res.json(results.years);
    });    
  });

  return opt.router;
};
