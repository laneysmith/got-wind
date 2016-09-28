(function() {
  'use strict';

  angular
    .module('windApp')
    .factory('dataFactory', dataFactory);

  dataFactory.$inject = ['$http', '$q'];

  function dataFactory($http, $q) {
    return {
      getWind: function() {
        return $http.get('http://localhost:3000/')
          .success(function(data) {
            return $q.resolve(data)
          })
          .error(function(errorMessage) {});
      }
    }
  }

})();
