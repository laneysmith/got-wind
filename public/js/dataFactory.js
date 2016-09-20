(function() {
  'use strict';

  angular
    .module('windApp')
    .factory('dataFactory', dataFactory);

		dataFactory.$inject = ['$http', '$q'];

		function dataFactory($http, $q) {
      return {
        getWind: function() {
          return $http.get('http://graphical.weather.gov/xml/sample_products/browser_interface/ndfdXMLclient.php?centerPointLat=38.0&centerPointLon=-97.4&distanceLat=50.0&distanceLon=50.0&resolutionSquare=20.0&product=time-series&begin=2016-09-08T00:00:00&end=2016-09-10T00:00:00&wdir=wdir&wspd=wspd&wdir=wdir')
            .success(function(data) {
              return $q.resolve(data)
            })
            .error(function(errorMessage) {
              //log the error message
            });
        }
      }
    }

})();
