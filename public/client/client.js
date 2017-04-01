(function () {
  'use strict';

  var pm = angular.module('pm', ['ngResource']),
      URLS = {
        APIBase: '/api/v1',
        make: 'make',
        model: 'model',
        year: 'year'
      },
      carSvc = ['$resource', 'URLS',
      function carSvc($resource) {
      	return {
          getMakes: function getMakes() {
            var path = [
                        URLS.APIBase,
                        URLS.make
                        ];
            return $resource(path.join('/')).query();
          },
          getModels: function getModels(make) {
            var path = [
                        URLS.APIBase,
                        URLS.make,
                        $window.encodeURIComponent(make),
                        URLS.model
                        ];
            return $resource(path.join('/')).query();
          },
          getYears: function getYears(make, model) {
            var path = [
                        URLS.APIBase,
                        URLS.make,
                        $window.encodeURIComponent(make),
                        URLS.model,
                        $window.encodeURIComponent(model),
                        URLS.year
                        ];
            return $resource(path.join('/')).query();
          }
        };
      }],
      PORFCtrl = ['$scope', '$rootScope', 'carSvc',
      function PORFCtrl($scope, $rootScope, carSvc) {
        $scope.makes = carSvc.getMakes();
        $scope.models = [];
        $scope.years = [];
        
        $scope.selectedMake = false;
        $scope.selectedModel = false;
        $scope.selectedYear = false;
        
        $scope.findMakes = function findMakes() {
          carSvc.getMakes()
          .$promise
          .then(function getMakesCb(makes) {
            console.log(makes);
          });
        };
        $scope.findMakes();
        
        $scope.findModels = function findModels() {
          carSvc.getModels($scope.selectedMake)
          .$promise
          .then(function getModelsCb(models) {
            console.log(models);
            $scope.models = models;
          });
        };
      }];
  pm
  .constant('URLS', URLS)
  .controller('PORFCtrl', PORFCtrl)
  .factory('carSvc', carSvc);
})();
